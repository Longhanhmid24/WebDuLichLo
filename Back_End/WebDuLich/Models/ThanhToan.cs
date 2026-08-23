using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class ThanhToan
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaThanhToan { get; set; }

        [Required]
        public int Madon { get; set; }

        [Required]
        [StringLength(50)]
        public string PhuongThuc { get; set; } = "VNPay";

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SoTien { get; set; }

        [StringLength(100)]
        public string? MaGiaoDich { get; set; }

        [Required]
        [StringLength(30)]
        public string TrangThai { get; set; } = "Success";

        public DateTime NgayThanhToan { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public virtual Dondattour? Dondattour { get; set; }
    }
}
