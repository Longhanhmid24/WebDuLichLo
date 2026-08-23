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
    public class DiaDiemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DiaDiemController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách điểm đến
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.DiaDiems
                .AsNoTracking()
                .Select(d => new
                {
                    d.MaDiaDiem,
                    d.TenDiaDiem,
                    d.QuocGia,
                    d.HinhAnh,
                    d.Mota,
                    d.NoiBat,
                    SoLuongTour = d.Tours.Count
                })
                .ToListAsync();
            return Ok(list);
        }

        // Lấy danh sách điểm đến nổi bật
        [HttpGet("noi-bat")]
        public async Task<IActionResult> GetNoiBat()
        {
            var list = await _context.DiaDiems
                .AsNoTracking()
                .Where(d => d.NoiBat)
                .ToListAsync();
            return Ok(list);
        }

        // Thêm điểm đến (Admin)
        [HttpPost("add")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Add([FromBody] DiaDiem dd)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            dd.TenDiaDiem = WebUtility.HtmlEncode(dd.TenDiaDiem);
            if (!string.IsNullOrEmpty(dd.Mota)) dd.Mota = WebUtility.HtmlEncode(dd.Mota);

            _context.DiaDiems.Add(dd);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Thêm điểm đến thành công!", DiaDiem = dd });
        }

        // Cập nhật điểm đến (Admin)
        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Update(int id, [FromBody] DiaDiem dd)
        {
            var item = await _context.DiaDiems.FindAsync(id);
            if (item == null) return NotFound(new { Message = "Điểm đến không tồn tại!" });

            item.TenDiaDiem = WebUtility.HtmlEncode(dd.TenDiaDiem);
            item.QuocGia = WebUtility.HtmlEncode(dd.QuocGia);
            item.HinhAnh = dd.HinhAnh;
            item.Mota = !string.IsNullOrEmpty(dd.Mota) ? WebUtility.HtmlEncode(dd.Mota) : null;
            item.NoiBat = dd.NoiBat;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật điểm đến thành công!", DiaDiem = item });
        }

        // Xóa điểm đến (Admin)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.DiaDiems.FindAsync(id);
            if (item == null) return NotFound(new { Message = "Điểm đến không tồn tại!" });

            _context.DiaDiems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa điểm đến thành công!" });
        }
    }
}
