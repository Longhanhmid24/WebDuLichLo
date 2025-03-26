using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class TaiKhoan
    {
        [Key]
        [Required]
        [EmailAddress]
        public string Emaildangki { get; set; } = string.Empty; // Khóa chính (PK)

        [StringLength(100)]
        public string? Tendangnhap { get; set; } // Có thể null (OAuth2)

        [StringLength(255)]
        public string? Matkhau { get; set; } // Có thể null nếu đăng nhập OAuth2

        public string? Sodienthoai { get; set; } // Có thể null

        [StringLength(255)]
        public string? Diachi { get; set; } // Có thể null

        public string? Gioitinh { get; set; } // Có thể null (Nam, Nữ, Khác)

        [StringLength(500)]
        public string? HinhAnh { get; set; } // Lưu đường dẫn ảnh đại diện, có thể null

        [Required]
        [StringLength(20)]
        public string Phanquyen { get; set; } = "User"; // User, Manager, Admin

        [Required]
        public DateTime NgayTao { get; set; } = DateTime.UtcNow; // Ngày tạo tài khoản

        // Danh sách đơn đặt tour của tài khoản này
        [JsonIgnore]
        public virtual ICollection<Dondattour> Dondattours { get; set; } = new List<Dondattour>();

    }
}
