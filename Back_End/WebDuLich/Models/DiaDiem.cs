using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class DiaDiem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaDiaDiem { get; set; }

        [Required]
        [StringLength(150)]
        public string TenDiaDiem { get; set; } = string.Empty;

        [StringLength(100)]
        public string QuocGia { get; set; } = "Việt Nam";

        [StringLength(500)]
        public string? HinhAnh { get; set; }

        public string? Mota { get; set; }

        public bool NoiBat { get; set; } = false;

        [JsonIgnore]
        public virtual ICollection<Tour> Tours { get; set; } = new List<Tour>();
    }
}
