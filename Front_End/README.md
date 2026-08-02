# WebDuLichLo

WebDuLichLo là một hệ thống website du lịch kết hợp frontend tĩnh và backend API, cho phép người dùng xem thông tin tour, đăng ký/đăng nhập, đặt tour và quản lý tài khoản. Dự án cũng hỗ trợ các chức năng quản trị như quản lý tour và phân quyền người dùng.

## Tính năng chính
- Quản lý tour: thêm, sửa, xóa, tìm kiếm và hiển thị danh sách tour.
- Người dùng: đăng ký tài khoản, đăng nhập, đăng nhập bằng Google, quên/mật khẩu, cập nhật thông tin cá nhân.
- Đặt tour: tạo đơn đặt tour và xem lịch sử đặt tour.
- Tích hợp ảnh: upload hình ảnh tour và avatar bằng Cloudinary.
- API documentation: Swagger để test API nhanh chóng.

## Công nghệ sử dụng
- Backend: ASP.NET Core Web API (.NET 9)
- Database: PostgreSQL qua Entity Framework Core
- Authentication: Cookie Authentication + Google OAuth
- Storage: Cloudinary cho hình ảnh
- Frontend: HTML, CSS, JavaScript

## Cấu trúc dự án
- Back_End/WebDuLich: mã nguồn backend và API
- Front_End: giao diện người dùng và tài nguyên frontend

## Hướng dẫn chạy dự án
### 1. Yêu cầu
- .NET SDK 9.0
- PostgreSQL
- Tài khoản Cloudinary và Google OAuth credentials (nếu cần dùng chức năng upload/đăng nhập Google)

### 2. Chạy backend
```bash
cd Back_End/WebDuLich
dotnet restore
dotnet run
```
Sau khi chạy, API sẽ có sẵn tại:
- Swagger: http://localhost:5000/swagger/index.html

### 3. Chạy frontend
Mở trực tiếp thư mục Front_End bằng trình duyệt, hoặc dùng Live Server để xem giao diện.

## Ghi chú
- Cấu hình kết nối database và dịch vụ bên ngoài được đặt trong các file appsettings.json hoặc appsettings.Development.json.
- Dự án hiện đang sử dụng cấu hình phát triển và có thể cần điều chỉnh địa chỉ frontend trong các API callback nếu triển khai thực tế.
