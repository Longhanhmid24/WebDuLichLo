using Microsoft.EntityFrameworkCore;
using WebDuLich.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// Đọc chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Đăng ký DbContext với Dependency Injection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Cấu hình Authentication (Google OAuth + Cookie)

// Cấu hình Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})

.AddCookie()
.AddGoogle(options =>
{
    var googleAuthNSection = builder.Configuration.GetSection("Authentication:Google");
    options.ClientId = googleAuthNSection["ClientId"];
    options.ClientSecret = googleAuthNSection["ClientSecret"];
    options.CallbackPath = "/signin-google";
    options.SaveTokens = true;
    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
});

// Thêm dịch vụ Controller
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// Cấu hình Cookie Policy
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.None; // Bắt buộc None cho cross-domain
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Bắt buộc Always cho SameSite=None
    options.LoginPath = "/login";  // Đảm bảo bạn có trang đăng nhập
});

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
                origin.EndsWith(".vercel.app") || 
                origin == "https://longhanhmid24.github.io" || 
                origin.StartsWith("http://localhost") || 
                origin.StartsWith("http://127.0.0.1"))
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Bắt buộc phải có để gửi cookie/token từ Frontend
    });
});

// Khởi tạo ứng dụng
var app = builder.Build();

// Tự động tạo các bảng trong Database Neon (nếu chưa có)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        Console.WriteLine("Lỗi khi tạo Database: " + ex.Message);
    }
}

// Bật hiển thị lỗi chi tiết để debug (tạm thời)
app.UseDeveloperExceptionPage();

app.UseCors("AllowAllOrigins");

// Luôn bật Swagger (kể cả trên Render) để dễ test
app.UseSwagger();
app.UseSwaggerUI();

// Tự động chuyển hướng từ trang chủ sang trang Swagger
app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger/index.html");
    return Task.CompletedTask;
});

// Render đã xử lý HTTPS ở tầng proxy, không cần HttpsRedirection
app.UseStaticFiles();
app.UseDefaultFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
