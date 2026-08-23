using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Security.Claims;
using WebDuLich.Data;
using WebDuLich.Models;
using WebDuLich.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace WebDuLich.Controllers
{
    [Route("api/[controller]")] // Route API sẽ là "api/TaiKhoan"
    [ApiController] // Đánh dấu đây là API Controller
    public class TaiKhoanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly Cloudinary _cloudinary;
        private readonly IJwtService _jwtService;

        // Inject ApplicationDbContext, IMemoryCache, Cloudinary và IJwtService
        public TaiKhoanController(ApplicationDbContext context, IMemoryCache memoryCache, Cloudinary cloudinary, IJwtService jwtService)
        {
            _context = context;
            _cache = memoryCache;
            _cloudinary = cloudinary;
            _jwtService = jwtService;
        }

        // API Đăng ký tài khoản mới
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterRequest request)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.TaiKhoans.AnyAsync(u => u.Emaildangki == request.Emaildangki))
                return BadRequest(new { Message = "Email đã được đăng ký!" });

            // Nếu đăng ký bằng tài khoản thường, mật khẩu không được để trống
            if (string.IsNullOrWhiteSpace(request.Matkhau) && !request.Emaildangki.EndsWith("@oauth.com"))
                return BadRequest(new { Message = "Mật khẩu không được để trống khi đăng ký bằng email!" });

            // Mã hóa mật khẩu nếu có
            string? hashedPassword = request.Matkhau != null ? BCrypt.Net.BCrypt.HashPassword(request.Matkhau) : null;

            // Tạo tài khoản mới (Làm sạch XSS cho Tên đăng nhập)
            var user = new TaiKhoan
            {
                Emaildangki = request.Emaildangki,
                Tendangnhap = WebUtility.HtmlEncode(request.Tendangnhap ?? string.Empty),
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
        public async Task<IActionResult> Login([FromForm] LoginRequest request)
        {
            // Tìm tài khoản theo email
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == request.Emaildangki);
            if (user == null || string.IsNullOrEmpty(user.Matkhau) || !BCrypt.Net.BCrypt.Verify(request.Matkhau, user.Matkhau)) // Kiểm tra mật khẩu
            {
                return Unauthorized(new { Message = "Email hoặc mật khẩu không đúng!" });
            }

            // Sinh JWT Token
            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                Message = "Đăng nhập thành công!",
                Email = user.Emaildangki,
                Tendangnhap = user.Tendangnhap,
                Phanquyen = user.Phanquyen,
                HinhAnh = user.HinhAnh,
                Token = token
            });
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
                    Tendangnhap = WebUtility.HtmlEncode(name ?? "Người dùng Google"),
                    NgayTao = DateTime.UtcNow,
                    Phanquyen = "user" // hoặc "khachhang"
                };
                _context.TaiKhoans.Add(user);
                await _context.SaveChangesAsync();
            }

            // Sinh JWT Token cho tài khoản đăng nhập bằng Google
            var token = _jwtService.GenerateToken(user);

            return Redirect($"https://web-du-lich-lo.vercel.app/html/auth/google-redirect.html?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Emaildangki)}&name={Uri.EscapeDataString(user.Tendangnhap)}&role={Uri.EscapeDataString(user.Phanquyen)}");
        }
        // API lấy danh sách người dùng (Chỉ dành cho Admin)
        [HttpGet]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.TaiKhoans.AsNoTracking().ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                var errMsg = ex.InnerException != null ? $"{ex.Message} -> {ex.InnerException.Message}" : ex.Message;
                Console.WriteLine($"Lỗi GetUsers: {errMsg}");
                return StatusCode(500, new { Message = $"Lỗi cơ sở dữ liệu: {errMsg}" });
            }
        }
       
        // API cập nhật quyền người dùng (Chỉ dành cho Admin)
        [HttpPut("{email}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> UpdateUserRole(string email, [FromForm] string phanquyen)
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại!" });

            user.Phanquyen = WebUtility.HtmlEncode(phanquyen);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật quyền thành công!" });
        }

        // API Admin chỉnh sửa toàn bộ thông tin người dùng
        [HttpPut("admin-update/{email}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> AdminUpdateUser(string email, [FromForm] AdminUpdateUserRequest request)
        {
            try
            {
                var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
                if (user == null)
                    return NotFound(new { Message = "Người dùng không tồn tại!" });

                if (!string.IsNullOrWhiteSpace(request.Tendangnhap))
                    user.Tendangnhap = WebUtility.HtmlEncode(request.Tendangnhap);

                if (!string.IsNullOrWhiteSpace(request.Matkhau))
                    user.Matkhau = BCrypt.Net.BCrypt.HashPassword(request.Matkhau);

                if (request.Sodienthoai != null)
                    user.Sodienthoai = WebUtility.HtmlEncode(request.Sodienthoai);

                if (request.Diachi != null)
                    user.Diachi = WebUtility.HtmlEncode(request.Diachi);

                if (request.Gioitinh != null)
                    user.Gioitinh = WebUtility.HtmlEncode(request.Gioitinh);

                if (!string.IsNullOrWhiteSpace(request.Phanquyen))
                    user.Phanquyen = WebUtility.HtmlEncode(request.Phanquyen);

                if (!string.IsNullOrWhiteSpace(request.TrangThai))
                    user.TrangThai = WebUtility.HtmlEncode(request.TrangThai);

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Cập nhật thông tin người dùng thành công!", User = user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi cập nhật người dùng: " + ex.Message });
            }
        }

        // API xóa tài khoản người dùng (Chỉ dành cho Admin)
        [HttpDelete("{email}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại!" });

            _context.TaiKhoans.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa tài khoản thành công!" });
        }

        //API lấy thông tin 1 người dùng (Yêu cầu đăng nhập, chỉ xem thông tin chính mình hoặc là Admin)
        [HttpGet("info/{email}")]
        [Authorize]
        public async Task<IActionResult> GetUserInfo(string email)
        {
            try
            {
                var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isUserAdmin = User.IsInRole("Admin") || User.IsInRole("admin");

                if (!isUserAdmin && !string.Equals(currentUserEmail, email, StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }

                var user = await _context.TaiKhoans.AsNoTracking().FirstOrDefaultAsync(u => u.Emaildangki == email);
                if (user == null)
                    return NotFound(new { Message = "Người dùng không tồn tại!" });

                return Ok(user); // Trả về đối tượng người dùng dưới dạng JSON
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi lấy thông tin người dùng: " + ex.Message });
            }
        }

        //API cập nhật thông tin người dùng (Yêu cầu đăng nhập, chỉ sửa thông tin chính mình hoặc là Admin)
        [HttpPut("update/{email}")]
        [Authorize]
        public async Task<IActionResult> UpdateUserInfo(
            string email,
            [FromForm] UpdateUserRequest request)
        {
            try
            {
                var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isUserAdmin = User.IsInRole("Admin") || User.IsInRole("admin");

                if (!isUserAdmin && !string.Equals(currentUserEmail, email, StringComparison.OrdinalIgnoreCase))
                {
                    return Forbid();
                }

                var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
                if (user == null)
                    return NotFound(new { Message = "Người dùng không tồn tại!" });

                // Cập nhật các trường thông tin khác & Làm sạch XSS
                if (request.Tendangnhap != null) user.Tendangnhap = WebUtility.HtmlEncode(request.Tendangnhap);
                if (request.Matkhau != null) user.Matkhau = BCrypt.Net.BCrypt.HashPassword(request.Matkhau);
                if (request.Sodienthoai != null) user.Sodienthoai = WebUtility.HtmlEncode(request.Sodienthoai);
                if (request.Diachi != null) user.Diachi = WebUtility.HtmlEncode(request.Diachi);
                if (request.Gioitinh != null) user.Gioitinh = WebUtility.HtmlEncode(request.Gioitinh);

                // Xử lý ảnh đại diện bằng Cloudinary
                if (request.HinhAnh != null && request.HinhAnh.Length > 0)
                {
                    using var stream = request.HinhAnh.OpenReadStream();
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(request.HinhAnh.FileName, stream),
                        Folder = "avatars"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        return StatusCode(500, new { Message = $"Lỗi tải ảnh đại diện lên Cloudinary: {uploadResult.Error.Message}" });
                    }

                    user.HinhAnh = uploadResult.SecureUrl.ToString();
                }

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Cập nhật thông tin thành công!", HinhAnh = user.HinhAnh });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi cập nhật người dùng: {ex.Message}");
                return StatusCode(500, new { Message = $"Lỗi hệ thống khi cập nhật: {ex.Message}" });
            }
        }


        [HttpGet("download/{fileName}")]
        public IActionResult DownloadFile(string fileName)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = "Tệp không tồn tại!" });
            }

            return PhysicalFile(filePath, "image/png", fileName);
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromForm] string email)
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Không tìm thấy người dùng với email này!" });

            var token = Guid.NewGuid().ToString(); // Tạo mã token ngẫu nhiên
            var cacheKey = $"reset-token:{email}";
            _cache.Set(cacheKey, token, TimeSpan.FromMinutes(15)); // Lưu token tạm trong cache (15 phút)

            // Tạo đường dẫn chứa token để người dùng reset
            var resetUrl = $"https://yourfrontend.com/reset-password.html?email={Uri.EscapeDataString(email)}&token={token}";

            // Gửi mail (hoặc log ra console để test)
            Console.WriteLine($"Reset URL: {resetUrl}");

            // Có thể dùng hàm gửi mail tại đây nếu bạn đã có
            return Ok(new
            {
                Message = "Liên kết đặt lại mật khẩu đã được gửi tới email (console)!",
                Token = token
            });

        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromForm] string email, [FromForm] string token, [FromForm] string newPassword)
        {
            var cacheKey = $"reset-token:{email}";

            // Kiểm tra token trong cache
            if (!_cache.TryGetValue(cacheKey, out string? savedToken) || savedToken != token)
                return BadRequest(new { Message = "Token không hợp lệ hoặc đã hết hạn!" });

            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Không tìm thấy người dùng!" });

            if (string.IsNullOrWhiteSpace(newPassword))
                return BadRequest(new { Message = "Mật khẩu mới không được để trống!" });

            // Hash mật khẩu và cập nhật
            user.Matkhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            // Xóa token sau khi sử dụng
            _cache.Remove(cacheKey);

            return Ok(new { Message = "Đặt lại mật khẩu thành công!" });
        }
    }
}

