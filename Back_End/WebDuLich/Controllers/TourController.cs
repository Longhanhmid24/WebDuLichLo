using Microsoft.AspNetCore.Mvc;
using WebDuLich.Models;
using WebDuLich.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TourController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API để thêm tour
        [HttpPost("add")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddTour([FromForm] Tour tour, IFormFile? imageFile)
        {
            try
            {
                if (tour == null)
                    return BadRequest("Dữ liệu không hợp lệ");

                if (tour.NgayKetThuc < tour.NgayKhoiHanh)
                    return BadRequest("Ngày kết thúc phải sau ngày khởi hành");

                if (imageFile != null)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/tours");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    tour.HinhAnh = "/images/tours/" + uniqueFileName;
                }

                _context.Tours.Add(tour);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tour đã được thêm thành công!", tour });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        [HttpGet("get-tour")]
        public async Task<IActionResult> GetAllTours()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}"; // Lấy URL gốc của server

            var tours = await _context.Tours
                .Select(t => new
                {
                    t.Tentour,
                    t.Mota,
                    t.Gia,
                    HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : $"{baseUrl}{t.HinhAnh}", // Tạo đường dẫn đầy đủ
                    t.LoaiTour
                })
                .ToListAsync();

            return Ok(tours);
        }

    }
}
