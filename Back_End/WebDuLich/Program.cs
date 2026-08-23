using Microsoft.EntityFrameworkCore;
using WebDuLich.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using CloudinaryDotNet;
using WebDuLich.Services;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Forwarded Headers để Render proxy truyền đúng HTTPS scheme sang .NET
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Đọc chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Đăng ký DbContext với Dependency Injection (Sử dụng DbContextPool để tối ưu hiệu năng backend)
builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Đăng ký JwtService
builder.Services.AddScoped<IJwtService, JwtService>();

// Cấu hình Cloudinary
var cloudinarySection = builder.Configuration.GetSection("Cloudinary");
var account = new Account(
    cloudinarySection["CloudName"],
    cloudinarySection["ApiKey"],
    cloudinarySection["ApiSecret"]
);
var cloudinary = new Cloudinary(account);
builder.Services.AddSingleton(cloudinary);

// Cấu hình Authentication (JWT Bearer + Cookie + Google OAuth)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtConfig = builder.Configuration.GetSection("Jwt");
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtConfig["Issuer"],
        ValidAudience = jwtConfig["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!)),
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name,
        ClockSkew = TimeSpan.Zero
    };
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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebDuLich API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
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

app.UseForwardedHeaders();

// Tự động tạo các bảng và bổ sung cột mới vào Database Neon (nếu chưa có)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();

        // Bổ sung tự động các cột mới vào các bảng đã tồn tại trong DB PostgreSQL
        db.Database.ExecuteSqlRaw(@"
            ALTER TABLE ""TaiKhoan"" ADD COLUMN IF NOT EXISTS ""TrangThai"" text DEFAULT 'HoatDong';
            ALTER TABLE ""Tour"" ADD COLUMN IF NOT EXISTS ""MaDiaDiem"" integer NULL;
            ALTER TABLE ""Tour"" ADD COLUMN IF NOT EXISTS ""TrangThai"" text DEFAULT 'DangMo';
            ALTER TABLE ""Tour"" ADD COLUMN IF NOT EXISTS ""GiaKhuyenMai"" numeric(18,2) NULL;
            ALTER TABLE ""Dondattour"" ADD COLUMN IF NOT EXISTS ""TrangThai"" text DEFAULT 'ChoXacNhan';
            ALTER TABLE ""Dondattour"" ADD COLUMN IF NOT EXISTS ""MaGiamGia"" text NULL;
            ALTER TABLE ""Dondattour"" ADD COLUMN IF NOT EXISTS ""SotienGiam"" numeric(18,2) DEFAULT 0;
            ALTER TABLE ""Dondattour"" ADD COLUMN IF NOT EXISTS ""HoTenNguoiLienHe"" text NULL;
            ALTER TABLE ""Dondattour"" ADD COLUMN IF NOT EXISTS ""SdtLienHe"" text NULL;
        ");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Lỗi khi cập nhật Database Schema: " + ex.Message);
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
