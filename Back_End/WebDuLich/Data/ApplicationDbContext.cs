using Microsoft.EntityFrameworkCore;
using WebDuLich.Models;

namespace WebDuLich.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Tour> Tours { get; set; }
        public DbSet<Dondattour> Dondattours { get; set; }

        public DbSet<TaiKhoan> taiKhoans { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tour>().ToTable("Tour");
            modelBuilder.Entity<Dondattour>().ToTable("Dondattour");
            modelBuilder.Entity<TaiKhoan>().ToTable("TaiKhoan");

            // Định nghĩa quan hệ giữa Tour và Dondattour
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.Tour) // Mỗi Dondattour có 1 Tour
                .WithMany() // Một Tour có nhiều Dondattour
                .HasForeignKey(d => d.Matour) // FK Matour
                .OnDelete(DeleteBehavior.Cascade); // Khi xóa Tour, xóa luôn Dondattour

            // Quan hệ 1-N: Một tài khoản có thể có nhiều đơn đặt tour
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.TaiKhoan)  // Mỗi Dondattour có 1 TaiKhoan
                .WithMany(tk => tk.Dondattours) // Một TaiKhoan có nhiều Dondattour
                .HasForeignKey(d => d.Emaildangki)
                .OnDelete(DeleteBehavior.Cascade);


        }
    }


}
