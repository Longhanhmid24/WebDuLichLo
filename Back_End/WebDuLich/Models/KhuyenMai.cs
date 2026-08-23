using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class KhuyenMai
    {
        [Key]
        [StringLength(50)]
        public string MaGiamGia { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal PhanTramGiam { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GiamToiDa { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaTriToiThieu { get; set; }

        public DateTime NgayBatDau { get; set; }

        public DateTime NgayKetThuc { get; set; }

        public int SoLuong { get; set; } = 100;

        public int DaSudung { get; set; } = 0;

        public bool TrangThai { get; set; } = true;

        [JsonIgnore]
        public virtual ICollection<Dondattour> Dondattours { get; set; } = new List<Dondattour>();
    }
}
