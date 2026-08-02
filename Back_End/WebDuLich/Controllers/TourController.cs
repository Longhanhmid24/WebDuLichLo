using Microsoft.AspNetCore.Mvc;
using WebDuLich.Models;
using WebDuLich.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System;
using System.Buffers.Text;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Cloudinary _cloudinary;

        public TourController(ApplicationDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
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

                // Đảm bảo DateTime có Kind là Utc để tương thích với PostgreSQL timestamptz
                tour.NgayKhoiHanh = DateTime.SpecifyKind(tour.NgayKhoiHanh, DateTimeKind.Utc);
                tour.NgayKetThuc = DateTime.SpecifyKind(tour.NgayKetThuc, DateTimeKind.Utc);

                if (tour.NgayKetThuc < tour.NgayKhoiHanh)
                    return BadRequest("Ngày kết thúc phải sau ngày khởi hành");

                if (imageFile != null)
                {
                    using var stream = imageFile.OpenReadStream();
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(imageFile.FileName, stream),
                        Folder = "tours"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        return StatusCode(500, $"Lỗi tải ảnh lên Cloudinary: {uploadResult.Error.Message}");
                    }

                    tour.HinhAnh = uploadResult.SecureUrl.ToString();
                }

                _context.Tours.Add(tour);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tour đã được thêm thành công!", tour });
            }
            catch (Exception ex)
            {
                var errMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, $"Lỗi server: {errMsg}");
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
                    HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : (t.HinhAnh.StartsWith("http") ? t.HinhAnh : $"{baseUrl}{t.HinhAnh}"),
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
                    .Take(11)
                    .Select(t => new
                    {
                        t.Tentour,
                        HinhAnh = string.IsNullOrEmpty(t.HinhAnh) ? null : (t.HinhAnh.StartsWith("http") ? t.HinhAnh : $"{baseUrl}{t.HinhAnh}")
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

        [HttpGet("search")]
        public async Task<IActionResult> SearchTours(string keyword)
        {
            if (string.IsNullOrEmpty(keyword))
            {
                return BadRequest(new { message = "Từ khóa tìm kiếm không hợp lệ." });
            }

            var tours = await _context.Tours
                .Where(t => t.Tentour.Contains(keyword))  // Tìm tour chứa từ khóa
                .ToListAsync();

            return Ok(tours);
        }

        // API lấy chi tiết 1 tour theo Matour
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTourById(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
            {
                return NotFound("Tour không tồn tại.");
            }
            return Ok(tour);
        }

        // API cập nhật thông tin tour
        [HttpPut("update/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateTour(int id, [FromForm] Tour updatedTour, IFormFile? imageFile)
        {
            try
            {
                var tour = await _context.Tours.FindAsync(id);
                if (tour == null)
                {
                    return NotFound("Tour không tồn tại.");
                }

                tour.Tentour = updatedTour.Tentour;
                tour.Gia = updatedTour.Gia;
                
                // Đảm bảo múi giờ UTC cho PostgreSQL
                tour.NgayKhoiHanh = DateTime.SpecifyKind(updatedTour.NgayKhoiHanh, DateTimeKind.Utc);
                tour.NgayKetThuc = DateTime.SpecifyKind(updatedTour.NgayKetThuc, DateTimeKind.Utc);
                
                if (tour.NgayKetThuc < tour.NgayKhoiHanh)
                {
                    return BadRequest(new { message = "Ngày kết thúc phải sau ngày khởi hành" });
                }

                tour.Mota = updatedTour.Mota;
                tour.Sokhach = updatedTour.Sokhach;
                tour.LoaiTour = updatedTour.LoaiTour;

                if (imageFile != null)
                {
                    using var stream = imageFile.OpenReadStream();
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(imageFile.FileName, stream),
                        Folder = "tours"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        return StatusCode(500, $"Lỗi tải ảnh lên Cloudinary: {uploadResult.Error.Message}");
                    }
                    tour.HinhAnh = uploadResult.SecureUrl.ToString();
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật tour thành công!", tour });
            }
            catch (Exception ex)
            {
                var errMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                return StatusCode(500, $"Lỗi server: {errMsg}");
            }
        }
    }
}

