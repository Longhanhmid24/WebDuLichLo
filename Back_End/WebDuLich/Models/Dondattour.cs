using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class Dondattour
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Madon { get; set; }

        [Required]
        public int Matour { get; set; } // FK đến Tour

        [Required]
        public DateTime Ngaydat { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Tongtien { get; set; }

        [Required]
        public int Songuoi { get; set; }

        // FK đến TaiKhoan (Người đặt tour)
        [Required]
        [ForeignKey("TaiKhoan")]
        public string Emaildangki { get; set; } = string.Empty;

        // Navigation Properties
        public virtual Tour? Tour { get; set; }

        [JsonIgnore]
        public virtual TaiKhoan? TaiKhoan { get; set; }
    }
}
