using Microsoft.AspNetCore.Mvc;
using WebDuLich.Models;
using WebDuLich.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System;
using System.Buffers.Text;

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
                    t.Matour, // Thêm Matour vào kết quả
                    t.Tentour,
                    t.Mota,
                    t.Gia,
                    GiaNguoiLon = t.Gia,
                    GiaTreEm = Math.Round(t.Gia * 2 / 3, 2),
                    GiaTreNho = Math.Round(t.Gia / 2, 2),
                    t.NgayKhoiHanh,
                    t.NgayKetThuc,
                    t.Sokhach,
                    HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : $"{baseUrl}{t.HinhAnh}",
                    t.LoaiTour
                })
                .ToListAsync();

            return Ok(tours);
        }


        [HttpGet("random-tours")]
        public async Task<IActionResult> GetRandomTours()
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var randomTours = await _context.Tours
                    .OrderBy(t => Guid.NewGuid())
                    .Take(6)
                    .Select(t => new
                    {
                        t.Tentour,
                        HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : $"{baseUrl}{t.HinhAnh}"
                    })
                    .ToListAsync();

                return Ok(randomTours);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                Console.WriteLine($"Lỗi trong GetRandomTours: {ex.Message}");
                return StatusCode(500, "Lỗi server nội bộ.");
            }
        }

        // API để xóa tour theo Matour
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            try
            {
                var tour = await _context.Tours.FindAsync(id);
                if (tour == null)
                {
                    return NotFound("Tour không tồn tại.");
                }

                _context.Tours.Remove(tour);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tour đã được xóa thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // API tìm kiếm tour theo tên
        [HttpGet("search")]
        public async Task<IActionResult> SearchTours([FromQuery] string searchTerm)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var tours = await _context.Tours
                    .Where(t => t.Tentour.Contains(searchTerm))
                    .Select(t => new
                    {
                        t.Matour,
                        t.Tentour,
                        t.Mota,
                        t.Gia,
                        GiaNguoiLon = t.Gia,
                        GiaTreEm = Math.Round(t.Gia * 2 / 3, 2),
                        GiaTreNho = Math.Round(t.Gia / 2, 2),
                        t.NgayKhoiHanh,
                        t.NgayKetThuc,
                        t.Sokhach,
                        HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : $"{baseUrl}{t.HinhAnh}",
                        t.LoaiTour
                    })
                    .ToListAsync();

                return Ok(tours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }

}

