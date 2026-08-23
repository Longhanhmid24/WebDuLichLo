using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebDuLich.Models
{
    public class YeuThich
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaYeuThich { get; set; }

        [Required]
        public string Emaildangki { get; set; } = string.Empty;

        [Required]
        public int Matour { get; set; }

        public DateTime NgayThem { get; set; } = DateTime.UtcNow;

        public virtual Tour? Tour { get; set; }

        [JsonIgnore]
        public virtual TaiKhoan? TaiKhoan { get; set; }
    }
}
