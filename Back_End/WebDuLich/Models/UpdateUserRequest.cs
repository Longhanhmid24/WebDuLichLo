using Microsoft.AspNetCore.Http;

namespace WebDuLich.Models
{
    public class UpdateUserRequest
    {
        public string? Tendangnhap { get; set; }
        public string? Matkhau { get; set; }
        public string? Sodienthoai { get; set; }
        public string? Diachi { get; set; }
        public string? Gioitinh { get; set; }
        public IFormFile? HinhAnh { get; set; }
    }
}
