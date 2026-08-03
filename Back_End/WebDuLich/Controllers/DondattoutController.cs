using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tất cả API đơn hàng bắt buộc phải xác thực JWT
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

            // Tự động lấy email từ JWT Token để đảm bảo không bị giả mạo
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserEmail))
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng!" });

            don.Emaildangki = currentUserEmail;
            don.Ngaydat = DateTime.UtcNow;

            _context.Dondattours.Add(don);
            await _context.SaveChangesAsync();

            return Ok(don);
        }

        // API để lấy tất cả đơn đặt tour
        [HttpGet("get-orders")]
        public async Task<IActionResult> GetOrders([FromQuery] string? email)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isUserAdmin = User.IsInRole("Admin");

            // Nếu không phải Admin, chỉ cho xem đơn hàng của chính mình
            var targetEmail = isUserAdmin && !string.IsNullOrEmpty(email) ? email : currentUserEmail;

            if (string.IsNullOrEmpty(targetEmail))
            {
                return BadRequest("Email không được để trống.");
            }

            var orders = await _context.Dondattours
                .Include(d => d.Tour)
                .Include(d => d.TaiKhoan)
                .Where(d => d.Emaildangki == targetEmail)
                .ToListAsync();

            return Ok(orders);
        }

        // API để xóa đơn đặt tour
        [HttpDelete("delete-order/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isUserAdmin = User.IsInRole("Admin");

            var order = await _context.Dondattours.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            // Chỉ cho phép xóa nếu là chủ đơn hàng hoặc Admin
            if (!isUserAdmin && !string.Equals(order.Emaildangki, currentUserEmail, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            _context.Dondattours.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
