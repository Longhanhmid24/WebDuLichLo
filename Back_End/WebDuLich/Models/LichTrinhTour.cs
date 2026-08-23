using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class LichTrinhTour
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaLichTrinh { get; set; }

        [Required]
        public int Matour { get; set; }

        [Required]
        public int NgayThu { get; set; }

        [Required]
        [StringLength(255)]
        public string TieuDe { get; set; } = string.Empty;

        public string? ChiTiet { get; set; }

        [StringLength(100)]
        public string? BuaAn { get; set; }

        [JsonIgnore]
        public virtual Tour? Tour { get; set; }
    }
}
