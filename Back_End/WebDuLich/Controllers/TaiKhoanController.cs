using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebDuLich.Data;
using WebDuLich.Models;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")] // Route API sẽ là "api/TaiKhoan"
    [ApiController] // Đánh dấu đây là API Controller
    public class TaiKhoanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Inject ApplicationDbContext để làm việc với database
        public TaiKhoanController(ApplicationDbContext context)
        {
            _context = context;
        }

        // API Đăng ký tài khoản mới
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] string emaildangki, [FromForm] string tendangnhap, [FromForm] string? matkhau)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.TaiKhoans.AnyAsync(u => u.Emaildangki == emaildangki))
                return BadRequest(new { Message = "Email đã được đăng ký!" });

            // Nếu đăng ký bằng tài khoản thường, mật khẩu không được để trống
            if (string.IsNullOrWhiteSpace(matkhau) && !emaildangki.EndsWith("@oauth.com"))
                return BadRequest(new { Message = "Mật khẩu không được để trống khi đăng ký bằng email!" });

            // Mã hóa mật khẩu nếu có
            string? hashedPassword = matkhau != null ? BCrypt.Net.BCrypt.HashPassword(matkhau) : null;

            // Tạo tài khoản mới
            var user = new TaiKhoan
            {
                Emaildangki = emaildangki,
                Tendangnhap = tendangnhap,
                Matkhau = hashedPassword, // Nếu OAuth2 thì mật khẩu có thể null
                NgayTao = DateTime.UtcNow,
                Phanquyen = "User" // Mặc định là User
            };

            _context.TaiKhoans.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đăng ký thành công!",
                Email = user.Emaildangki
            });
        }



        // API Đăng nhập tài khoản

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] string emaildangki, [FromForm] string matkhau)
        {
            // Tìm tài khoản theo email
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == emaildangki);
            if (user == null || !BCrypt.Net.BCrypt.Verify(matkhau, user.Matkhau)) // Kiểm tra mật khẩu
            {
                return Unauthorized(new { Message = "Email hoặc mật khẩu không đúng!" });
            }

            return Ok(new { Message = "Đăng nhập thành công!", Email = user.Emaildangki });
        }

        // API Đăng nhập bằng Google
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var redirectUrl = Url.Action(nameof(GoogleCallback), "TaiKhoan"); // URL callback sau khi đăng nhập Google
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl }; // Cấu hình xác thực
            return Challenge(properties, GoogleDefaults.AuthenticationScheme); // Chuyển hướng tới trang đăng nhập Google
        }

        // API Callback sau khi đăng nhập Google
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            // Lấy thông tin xác thực từ Google
            var authResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!authResult.Succeeded)
                return BadRequest("Xác thực thất bại!");

            var claims = authResult.Principal.Identities.FirstOrDefault()?.Claims; // Lấy danh sách claims
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value; // Lấy email
            var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value; // Lấy tên

            if (email == null) return BadRequest("Không lấy được email từ Google!");

            // Kiểm tra xem tài khoản đã có trong hệ thống chưa
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
            {
                // Nếu chưa có thì tạo mới tài khoản
                user = new TaiKhoan
                {
                    Emaildangki = email,
                    Tendangnhap = name ?? "Người dùng Google",
                    NgayTao = DateTime.UtcNow
                };
                _context.TaiKhoans.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Đăng nhập Google thành công!", Email = user.Emaildangki });
        }
    }
}
