using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class Tour
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Matour { get; set; }

        [Required]
        [StringLength(255)]
        public string Tentour { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Gia { get; set; }

        [Required]
        public DateTime NgayKhoiHanh { get; set; } // Ngày khởi hành

        [Required]
        public DateTime NgayKetThuc { get; set; } // Ngày kết thúc
 
        public string? Mota { get; set; }

        [Required]
        public int Sokhach { get; set; }

        [Required]
        [StringLength(50)]
        public string LoaiTour { get; set; } = "Trong nước"; // Mặc định là "Trong nước"

        [StringLength(500)]
        public string? HinhAnh { get; set; } // Lưu đường dẫn ảnh

        public int? MaDiaDiem { get; set; } // FK đến DiaDiem

        [StringLength(30)]
        public string TrangThai { get; set; } = "DangMo"; // DangMo, HetCho, TamDung

        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaKhuyenMai { get; set; }

        public virtual DiaDiem? DiaDiem { get; set; }

        [JsonIgnore]
        public virtual ICollection<LichTrinhTour> LichTrinhs { get; set; } = new List<LichTrinhTour>();

        [JsonIgnore]
        public virtual ICollection<DanhGia> DanhGias { get; set; } = new List<DanhGia>();
    }
}
