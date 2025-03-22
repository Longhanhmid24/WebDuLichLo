using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

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
   
        public string? Mota { get; set; }

        [Required]
        public int Sokhach { get; set; }


        [StringLength(500)]
        public string? HinhAnh { get; set; } // Lưu đường dẫn ảnh
    }
}
