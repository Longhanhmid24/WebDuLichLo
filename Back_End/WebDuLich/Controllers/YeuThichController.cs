using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class YeuThichController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public YeuThichController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách tour yêu thích của người dùng
        [HttpGet]
        public async Task<IActionResult> GetUserWishlist()
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserEmail))
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng!" });

            var wishlist = await _context.YeuThichs
                .AsNoTracking()
                .Where(y => y.Emaildangki == currentUserEmail)
                .Include(y => y.Tour)
                .Select(y => new
                {
                    y.MaYeuThich,
                    y.Matour,
                    y.NgayThem,
                    Tour = y.Tour
                })
                .ToListAsync();

            return Ok(wishlist);
        }

        // Thêm/Xóa tour khỏi danh sách yêu thích
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleWishlist([FromForm] int matour)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserEmail))
                return Unauthorized(new { Message = "Không xác định được danh tính người dùng!" });

            var tour = await _context.Tours.FindAsync(matour);
            if (tour == null) return NotFound(new { Message = "Tour không tồn tại!" });

            var existing = await _context.YeuThichs
                .FirstOrDefaultAsync(y => y.Emaildangki == currentUserEmail && y.Matour == matour);

            if (existing != null)
            {
                _context.YeuThichs.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Đã xóa tour khỏi danh sách yêu thích!", IsFavorite = false });
            }

            var fav = new YeuThich
            {
                Emaildangki = currentUserEmail,
                Matour = matour,
                NgayThem = DateTime.UtcNow
            };

            _context.YeuThichs.Add(fav);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã thêm tour vào danh sách yêu thích!", IsFavorite = true, YeuThich = fav });
        }
    }
}
