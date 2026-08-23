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
    public class LichTrinhController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LichTrinhController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách lịch trình theo tour
        [HttpGet("tour/{matour}")]
        public async Task<IActionResult> GetByTour(int matour)
        {
            var list = await _context.LichTrinhTours
                .AsNoTracking()
                .Where(l => l.Matour == matour)
                .OrderBy(l => l.NgayThu)
                .ToListAsync();
            return Ok(list);
        }

        // Thêm hoặc cập nhật ngày lịch trình (Admin)
        [HttpPost("add-update")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> AddOrUpdate([FromBody] LichTrinhTour lt)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            lt.TieuDe = WebUtility.HtmlEncode(lt.TieuDe);
            if (!string.IsNullOrEmpty(lt.ChiTiet)) lt.ChiTiet = WebUtility.HtmlEncode(lt.ChiTiet);
            if (!string.IsNullOrEmpty(lt.BuaAn)) lt.BuaAn = WebUtility.HtmlEncode(lt.BuaAn);

            var existing = await _context.LichTrinhTours
                .FirstOrDefaultAsync(l => l.Matour == lt.Matour && l.NgayThu == lt.NgayThu);

            if (existing != null)
            {
                existing.TieuDe = lt.TieuDe;
                existing.ChiTiet = lt.ChiTiet;
                existing.BuaAn = lt.BuaAn;
                await _context.SaveChangesAsync();
                return Ok(new { Message = $"Cập nhật lịch trình ngày {lt.NgayThu} thành công!", LichTrinh = existing });
            }

            _context.LichTrinhTours.Add(lt);
            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Thêm lịch trình ngày {lt.NgayThu} thành công!", LichTrinh = lt });
        }

        // Xóa lịch trình (Admin)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.LichTrinhTours.FindAsync(id);
            if (item == null) return NotFound(new { Message = "Lịch trình không tồn tại!" });

            _context.LichTrinhTours.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa lịch trình thành công!" });
        }
    }
}
