using Microsoft.EntityFrameworkCore;
using WebDuLich.Models;

namespace WebDuLich.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Tour> Tours { get; set; }
        public DbSet<Dondattour> Dondattours { get; set; }
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<DiaDiem> DiaDiems { get; set; }
        public DbSet<DanhGia> DanhGias { get; set; }
        public DbSet<LichTrinhTour> LichTrinhTours { get; set; }
        public DbSet<ThanhToan> ThanhToans { get; set; }
        public DbSet<KhuyenMai> KhuyenMais { get; set; }
        public DbSet<YeuThich> YeuThichs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tour>().ToTable("Tour");
            modelBuilder.Entity<Dondattour>().ToTable("Dondattour");
            modelBuilder.Entity<TaiKhoan>().ToTable("TaiKhoan");
            modelBuilder.Entity<DiaDiem>().ToTable("DiaDiem");
            modelBuilder.Entity<DanhGia>().ToTable("DanhGia");
            modelBuilder.Entity<LichTrinhTour>().ToTable("LichTrinhTour");
            modelBuilder.Entity<ThanhToan>().ToTable("ThanhToan");
            modelBuilder.Entity<KhuyenMai>().ToTable("KhuyenMai");
            modelBuilder.Entity<YeuThich>().ToTable("YeuThich");

            // Quan hệ Tour và DiaDiem
            modelBuilder.Entity<Tour>()
                .HasOne(t => t.DiaDiem)
                .WithMany(d => d.Tours)
                .HasForeignKey(t => t.MaDiaDiem)
                .OnDelete(DeleteBehavior.SetNull);

            // Quan hệ Tour và Dondattour
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.Tour)
                .WithMany()
                .HasForeignKey(d => d.Matour)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ TaiKhoan và Dondattour
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.TaiKhoan)
                .WithMany(tk => tk.Dondattours)
                .HasForeignKey(d => d.Emaildangki)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ Dondattour và KhuyenMai
            modelBuilder.Entity<Dondattour>()
                .HasOne(d => d.KhuyenMai)
                .WithMany(km => km.Dondattours)
                .HasForeignKey(d => d.MaGiamGia)
                .OnDelete(DeleteBehavior.SetNull);

            // Quan hệ Dondattour và ThanhToan
            modelBuilder.Entity<ThanhToan>()
                .HasOne(tt => tt.Dondattour)
                .WithMany(d => d.ThanhToans)
                .HasForeignKey(tt => tt.Madon)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ DanhGia: Unique Index (Matour, Emaildangki) - Mỗi người dùng chỉ đánh giá 1 tour 1 lần
            modelBuilder.Entity<DanhGia>()
                .HasIndex(dg => new { dg.Matour, dg.Emaildangki })
                .IsUnique();

            modelBuilder.Entity<DanhGia>()
                .HasOne(dg => dg.Tour)
                .WithMany(t => t.DanhGias)
                .HasForeignKey(dg => dg.Matour)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DanhGia>()
                .HasOne(dg => dg.TaiKhoan)
                .WithMany(tk => tk.DanhGias)
                .HasForeignKey(dg => dg.Emaildangki)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ LichTrinhTour: Unique Index (Matour, NgayThu)
            modelBuilder.Entity<LichTrinhTour>()
                .HasIndex(lt => new { lt.Matour, lt.NgayThu })
                .IsUnique();

            modelBuilder.Entity<LichTrinhTour>()
                .HasOne(lt => lt.Tour)
                .WithMany(t => t.LichTrinhs)
                .HasForeignKey(lt => lt.Matour)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ YeuThich: Unique Index (Emaildangki, Matour)
            modelBuilder.Entity<YeuThich>()
                .HasIndex(yt => new { yt.Emaildangki, yt.Matour })
                .IsUnique();

            modelBuilder.Entity<YeuThich>()
                .HasOne(yt => yt.TaiKhoan)
                .WithMany(tk => tk.YeuThichs)
                .HasForeignKey(yt => yt.Emaildangki)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<YeuThich>()
                .HasOne(yt => yt.Tour)
                .WithMany()
                .HasForeignKey(yt => yt.Matour)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
