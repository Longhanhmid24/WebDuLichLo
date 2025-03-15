using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

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
        public string Trangthai { get; set; } = string.Empty;

        [Required]
        public int Songuoi { get; set; }

        // Navigation Property (Quan hệ với Tour)
        [ForeignKey("Matour")]
        public virtual Tour? Tour { get; set; }
    }
}
