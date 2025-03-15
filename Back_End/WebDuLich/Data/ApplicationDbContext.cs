using Microsoft.EntityFrameworkCore;
using WebDuLich.Models;

namespace WebDuLich.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Tour> Tours { get; set; }
        public DbSet<Dondattour> Dondattours { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tour>().ToTable("Tour");
            modelBuilder.Entity<Dondattour>().ToTable("Dondattour");


            // Định nghĩa quan hệ giữa Tour và Dondattour
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.Tour) // Mỗi Dondattour có 1 Tour
                .WithMany() // Một Tour có nhiều Dondattour
                .HasForeignKey(d => d.Matour) // FK Matour
                .OnDelete(DeleteBehavior.Cascade); // Khi xóa Tour, xóa luôn Dondattour
        }
    }


}
