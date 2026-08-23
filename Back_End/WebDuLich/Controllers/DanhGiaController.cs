using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DanhGiaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách đánh giá của tour
        [HttpGet("tour/{matour}")]
        public async Task<IActionResult> GetByTour(int matour)
        {
            var reviews = await _context.DanhGias
                .AsNoTracking()
                .Where(d => d.Matour == matour && d.TrangThai == "DaDuyet")
                .Include(d => d.TaiKhoan)
                .OrderByDescending(d => d.NgayDanhGia)
                .Select(d => new
                {
                    d.MaDanhGia,
                    d.Matour,
                    d.Emaildangki,
                    TenNguoiDanhGia = d.TaiKhoan != null ? d.TaiKhoan.Tendangnhap : d.Emaildangki,
                    Avatar = d.TaiKhoan != null ? d.TaiKhoan.HinhAnh : null,
                    d.SoSao,
                    d.BinhLuan,
                    d.NgayDanhGia
                })
                .ToListAsync();

            double avgStars = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.SoSao), 1) : 0;

            return Ok(new
            {
                DiemTrungBinh = avgStars,
                TongSoDanhGia = reviews.Count,
                DanhSach = reviews
            });
        }

        // Gửi đánh giá tour
        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddReview([FromForm] int matour, [FromForm] int soSao, [FromForm] string? binhLuan)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserEmail))
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng!" });

            var tour = await _context.Tours.FindAsync(matour);
            if (tour == null) return NotFound(new { Message = "Tour không tồn tại!" });

            // Kiểm tra xem đã từng đánh giá tour này chưa
            var existing = await _context.DanhGias.FirstOrDefaultAsync(d => d.Matour == matour && d.Emaildangki == currentUserEmail);
            if (existing != null)
            {
                existing.SoSao = Math.Clamp(soSao, 1, 5);
                existing.BinhLuan = !string.IsNullOrEmpty(binhLuan) ? WebUtility.HtmlEncode(binhLuan) : null;
                existing.NgayDanhGia = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Cập nhật đánh giá thành công!", DanhGia = existing });
            }

            var review = new DanhGia
            {
                Matour = matour,
                Emaildangki = currentUserEmail,
                SoSao = Math.Clamp(soSao, 1, 5),
                BinhLuan = !string.IsNullOrEmpty(binhLuan) ? WebUtility.HtmlEncode(binhLuan) : null,
                NgayDanhGia = DateTime.UtcNow,
                TrangThai = "DaDuyet"
            };

            _context.DanhGias.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đánh giá tour thành công!", DanhGia = review });
        }

        // Xóa đánh giá (Chủ sở hữu hoặc Admin)
        [HttpDelete("delete/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isUserAdmin = User.IsInRole("Admin") || User.IsInRole("admin");

            var review = await _context.DanhGias.FindAsync(id);
            if (review == null) return NotFound(new { Message = "Đánh giá không tồn tại!" });

            if (!isUserAdmin && !string.Equals(review.Emaildangki, currentUserEmail, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            _context.DanhGias.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa đánh giá thành công!" });
        }
    }
}
