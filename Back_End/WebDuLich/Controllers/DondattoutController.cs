using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DondattourController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DondattourController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] Dondattour don)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            don.Ngaydat = DateTime.Now;

            _context.Dondattours.Add(don);
            await _context.SaveChangesAsync();

            return Ok(don);
        }
        // API để lấy tất cả đơn đặt tour
        [HttpGet("get-orders")]
        public async Task<IActionResult> GetOrders([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email không được để trống.");
            }

            var orders = await _context.Dondattours
                .Include(d => d.Tour)
                .Include(d => d.TaiKhoan)
                .Where(d => d.TaiKhoan.Emaildangki == email)
                .ToListAsync();

            return Ok(orders);
        }

        // API để xóa đơn đặt tour
        [HttpDelete("delete-order/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Dondattours.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Dondattours.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
