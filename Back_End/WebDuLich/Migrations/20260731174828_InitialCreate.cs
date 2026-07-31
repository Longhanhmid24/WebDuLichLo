using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WebDuLich.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaiKhoan",
                columns: table => new
                {
                    Emaildangki = table.Column<string>(type: "text", nullable: false),
                    Tendangnhap = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Matkhau = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Sodienthoai = table.Column<string>(type: "text", nullable: true),
                    Diachi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Gioitinh = table.Column<string>(type: "text", nullable: true),
                    HinhAnh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Phanquyen = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaiKhoan", x => x.Emaildangki);
                });

            migrationBuilder.CreateTable(
                name: "Tour",
                columns: table => new
                {
                    Matour = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tentour = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Gia = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    NgayKhoiHanh = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Mota = table.Column<string>(type: "text", nullable: true),
                    Sokhach = table.Column<int>(type: "integer", nullable: false),
                    LoaiTour = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HinhAnh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tour", x => x.Matour);
                });

            migrationBuilder.CreateTable(
                name: "Dondattour",
                columns: table => new
                {
                    Madon = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Matour = table.Column<int>(type: "integer", nullable: false),
                    Ngaydat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Tongtien = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Songuoi = table.Column<int>(type: "integer", nullable: false),
                    Emaildangki = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dondattour", x => x.Madon);
                    table.ForeignKey(
                        name: "FK_Dondattour_TaiKhoan_Emaildangki",
                        column: x => x.Emaildangki,
                        principalTable: "TaiKhoan",
                        principalColumn: "Emaildangki",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Dondattour_Tour_Matour",
                        column: x => x.Matour,
                        principalTable: "Tour",
                        principalColumn: "Matour",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dondattour_Emaildangki",
                table: "Dondattour",
                column: "Emaildangki");

            migrationBuilder.CreateIndex(
                name: "IX_Dondattour_Matour",
                table: "Dondattour",
                column: "Matour");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Dondattour");

            migrationBuilder.DropTable(
                name: "TaiKhoan");

            migrationBuilder.DropTable(
                name: "Tour");
        }
    }
}
