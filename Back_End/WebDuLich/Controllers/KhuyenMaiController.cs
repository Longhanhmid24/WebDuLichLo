using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhuyenMaiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KhuyenMaiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách mã khuyến mãi đang hoạt động
        [HttpGet]
        public async Task<IActionResult> GetActivePromotions()
        {
            var now = DateTime.UtcNow;
            var list = await _context.KhuyenMais
                .AsNoTracking()
                .Where(k => k.TrangThai && k.NgayBatDau <= now && k.NgayKetThuc >= now && k.DaSudung < k.SoLuong)
                .ToListAsync();
            return Ok(list);
        }

        // Kiểm tra và tính giá trị giảm của mã khuyến mãi
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateCode([FromForm] string code, [FromForm] decimal tongTien)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { Message = "Mã giảm giá không được để trống!" });

            var now = DateTime.UtcNow;
            var km = await _context.KhuyenMais.FirstOrDefaultAsync(k => k.MaGiamGia.ToUpper() == code.Trim().ToUpper());

            if (km == null || !km.TrangThai)
                return NotFound(new { Message = "Mã giảm giá không tồn tại hoặc đã ngừng áp dụng!" });

            if (km.NgayBatDau > now || km.NgayKetThuc < now)
                return BadRequest(new { Message = "Mã giảm giá chưa đến đợt hoặc đã hết hạn!" });

            if (km.DaSudung >= km.SoLuong)
                return BadRequest(new { Message = "Mã giảm giá đã hết lượt sử dụng!" });

            if (tongTien < km.GiaTriToiThieu)
                return BadRequest(new { Message = $"Đơn hàng cần đạt tối thiểu {km.GiaTriToiThieu:N0} VNĐ để áp dụng mã này!" });

            decimal sotienGiam = Math.Round(tongTien * (km.PhanTramGiam / 100), 2);
            if (km.GiamToiDa > 0 && sotienGiam > km.GiamToiDa)
            {
                sotienGiam = km.GiamToiDa;
            }

            decimal tongTienSauGiam = Math.Max(0, tongTien - sotienGiam);

            return Ok(new
            {
                Message = "Áp dụng mã giảm giá thành công!",
                MaGiamGia = km.MaGiamGia,
                PhanTramGiam = km.PhanTramGiam,
                SotienGiam = sotienGiam,
                TongTienCu = tongTien,
                TongTienMoi = tongTienSauGiam
            });
        }

        // Thêm mã khuyến mãi (Admin)
        [HttpPost("add")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> AddPromotion([FromBody] KhuyenMai km)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            km.MaGiamGia = km.MaGiamGia.Trim().ToUpper();

            if (await _context.KhuyenMais.AnyAsync(k => k.MaGiamGia == km.MaGiamGia))
                return BadRequest(new { Message = "Mã giảm giá này đã tồn tại!" });

            km.NgayBatDau = DateTime.SpecifyKind(km.NgayBatDau, DateTimeKind.Utc);
            km.NgayKetThuc = DateTime.SpecifyKind(km.NgayKetThuc, DateTimeKind.Utc);

            _context.KhuyenMais.Add(km);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Thêm mã khuyến mãi thành công!", KhuyenMai = km });
        }

        // Xóa mã khuyến mãi (Admin)
        [HttpDelete("delete/{code}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> DeletePromotion(string code)
        {
            var km = await _context.KhuyenMais.FindAsync(code.ToUpper());
            if (km == null) return NotFound(new { Message = "Mã giảm giá không tồn tại!" });

            _context.KhuyenMais.Remove(km);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa mã giảm giá thành công!" });
        }
    }
}
