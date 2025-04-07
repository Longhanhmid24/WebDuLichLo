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

            return Ok(new
            {
                Message = "Đăng nhập thành công!",
                Email = user.Emaildangki,
                Tendangnhap = user.Tendangnhap,
                Phanquyen = user.Phanquyen // ✅ THÊM DÒNG NÀY
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
                    Tendangnhap = name ?? "Người dùng Google",
                    NgayTao = DateTime.UtcNow,
                    Phanquyen = "user" // hoặc "khachhang"
                };
                _context.TaiKhoans.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Đăng nhập Google thành công!", Email = user.Emaildangki });
        }
        // API lấy danh sách người dùng
   
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.TaiKhoans.ToListAsync();
            Console.WriteLine($"Tìm thấy {users.Count} tài khoản"); // In số lượng user vào console
            return Ok(users);
        }
       
        // API cập nhật quyền người dùng
        [HttpPut("{email}")]
        public async Task<IActionResult> UpdateUserRole(string email, [FromForm] string phanquyen)
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại!" });

            user.Phanquyen = phanquyen;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật quyền thành công!" });
        }

        // API xóa tài khoản người dùng
        [HttpDelete("{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại!" });

            _context.TaiKhoans.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa tài khoản thành công!" });
        }
        //API lấy thông tin 1 người dùng
        [HttpGet("info/{email}")]
        public async Task<IActionResult> GetUserInfo(string email)
        {
            try
            {
                var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
                if (user == null)
                    return NotFound(new { Message = "Người dùng không tồn tại!" });

                return Ok(user); // Trả về đối tượng người dùng dưới dạng JSON
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi lấy thông tin người dùng: " + ex.Message });
            }
        }

        //API cập nhật thông tin người dùng(đang bị lỗi)
        [HttpPut("update/{email}")]
        public async Task<IActionResult> UpdateUserInfo(
            string email,
            [FromForm] string? tendangnhap,
            [FromForm] string? matkhau,
            [FromForm] string? sodienthoai,
            [FromForm] string? diachi,
            [FromForm] string? gioitinh,
            [FromForm] IFormFile? hinhAnh)  // Sử dụng IFormFile để nhận ảnh
        {
            var user = await _context.TaiKhoans.FirstOrDefaultAsync(u => u.Emaildangki == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại!" });

            // Cập nhật các trường thông tin khác
            user.Tendangnhap = tendangnhap ?? user.Tendangnhap;
            user.Matkhau = matkhau ?? user.Matkhau;
            user.Sodienthoai = sodienthoai ?? user.Sodienthoai;
            user.Diachi = diachi ?? user.Diachi;
            user.Gioitinh = gioitinh ?? user.Gioitinh;

            // Xử lý ảnh đại diện
            if (hinhAnh != null && hinhAnh.Length > 0)
            {
                // Đường dẫn nơi lưu trữ ảnh trên server
                var uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "accounts");

                // Kiểm tra và tạo thư mục nếu chưa tồn tại
                if (!Directory.Exists(uploadsDirectory))
                {
                    Directory.CreateDirectory(uploadsDirectory);
                }

                // Lưu ảnh vào thư mục
                var filePath = Path.Combine(uploadsDirectory, hinhAnh.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await hinhAnh.CopyToAsync(stream);
                }

                // Cập nhật đường dẫn ảnh vào cơ sở dữ liệu
                user.HinhAnh = $"/uploads/{hinhAnh.FileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật thông tin thành công!" });
        }


        [HttpGet("download/{fileName}")]
        public IActionResult DownloadFile(string fileName)
        {
            // Đường dẫn tới tệp trong thư mục wwwroot
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

            // Kiểm tra xem tệp có tồn tại không
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = "Tệp không tồn tại!" });
            }

            // Đọc tệp vào byte array
            var fileBytes = System.IO.File.ReadAllBytes(filePath);

            // Trả về tệp cùng với Content-Type (Ví dụ cho hình ảnh là "image/png")
            return File(fileBytes, "anhmacdinh/png", fileName);
        }


    }
}

