using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDuLich.Migrations
{
    /// <inheritdoc />
    public partial class WebDuLich : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tour",
                columns: table => new
                {
                    Matour = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Tentour = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Gia = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayKhoiHanh = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Mota = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sokhach = table.Column<int>(type: "int", nullable: false),
                    LoaiTour = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HinhAnh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tour", x => x.Matour);
                });

            migrationBuilder.CreateTable(
                name: "Dondattour",
                columns: table => new
                {
                    Madon = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Matour = table.Column<int>(type: "int", nullable: false),
                    Ngaydat = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Tongtien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Trangthai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Songuoi = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dondattour", x => x.Madon);
                    table.ForeignKey(
                        name: "FK_Dondattour_Tour_Matour",
                        column: x => x.Matour,
                        principalTable: "Tour",
                        principalColumn: "Matour",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "Tour");
        }
    }
}
