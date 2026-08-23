using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class DanhGia
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaDanhGia { get; set; }

        [Required]
        public int Matour { get; set; }

        [Required]
        public string Emaildangki { get; set; } = string.Empty;

        [Required]
        [Range(1, 5, ErrorMessage = "Số sao đánh giá phải từ 1 đến 5 sao!")]
        public int SoSao { get; set; }

        [StringLength(1000)]
        public string? BinhLuan { get; set; }

        public DateTime NgayDanhGia { get; set; } = DateTime.UtcNow;

        [StringLength(20)]
        public string TrangThai { get; set; } = "DaDuyet";

        public virtual Tour? Tour { get; set; }

        [JsonIgnore]
        public virtual TaiKhoan? TaiKhoan { get; set; }
    }
}
