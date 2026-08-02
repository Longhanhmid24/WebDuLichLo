# WebDuLichLo

WebDuLichLo là dự án website du lịch, bao gồm giao diện frontend động và backend API ASP.NET Core. Bạn vó thể đăng nhập vào https://web-du-lich-lo.vercel.app để xem trang web 

## Mô tả
Dự án cho phép:
- Quản lý tour du lịch: thêm, sửa, xóa, tìm kiếm và hiển thị tour.
- Người dùng đăng ký, đăng nhập, đăng nhập bằng Google, quên mật khẩu, cập nhật thông tin cá nhân.
- Đặt tour và xem lịch sử đơn đặt.
- Upload ảnh tour và ảnh đại diện người dùng qua Cloudinary.
- Sử dụng Swagger để kiểm thử API.

## Công nghệ
- Backend: ASP.NET Core Web API (.NET 9)
- Database: PostgreSQL với Entity Framework Core
- Authentication: Cookie Authentication và Google OAuth
- Lưu trữ ảnh: Cloudinary
- Frontend: HTML, CSS, JavaScript

## Cấu trúc dự án
- `Back_End/WebDuLich`: mã nguồn backend.
- `Front_End`: giao diện người dùng và tài nguyên frontend.

## Cài đặt và chạy
### Yêu cầu
- .NET SDK 9.0
- PostgreSQL
- Cloudinary account (nếu cần upload ảnh)
- Google OAuth credentials (nếu cần đăng nhập Google)

### Chạy backend
```bash
cd Back_End/WebDuLich
dotnet restore
dotnet run
```
Backend sẽ chạy mặc định trên `http://localhost:5000` hoặc `https://localhost:5001`.

### Chạy frontend
Mở trực tiếp các file HTML trong `Front_End` bằng trình duyệt, hoặc dùng một local server tĩnh.

## Lưu ý
- Cấu hình kết nối database và các khóa bí mật được đặt trong `appsettings.json` và `appsettings.Development.json`.
- Nếu deploy thực tế, cần điều chỉnh callback URL Google và cấu hình CORS phù hợp.
