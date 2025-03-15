using Microsoft.AspNetCore.Mvc;
using WebDuLich.Models;
using WebDuLich.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> AddTour([FromForm] Tour tour, IFormFile? imageFile)
        {
            try
            {
                if (tour == null)
                    return BadRequest("Dữ liệu không hợp lệ");

                if (imageFile != null)
                {
                    var filePath = Path.Combine("wwwroot/images", imageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }
                    tour.HinhAnh = "/images/" + imageFile.FileName;
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


        // API lấy danh sách tất cả Tour
        [HttpGet("all")]
        public async Task<IActionResult> GetAllTours()
        {
            var tours = await _context.Tours.ToListAsync();
            return Ok(tours);
        }
    }
}
