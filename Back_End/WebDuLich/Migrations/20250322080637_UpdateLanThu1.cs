using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDuLich.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLanThu1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Emaildangki",
                table: "Dondattour",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TaiKhoan",
                columns: table => new
                {
                    Emaildangki = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Tendangnhap = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Matkhau = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Sodienthoai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Diachi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Gioitinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phanquyen = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaiKhoan", x => x.Emaildangki);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dondattour_Emaildangki",
                table: "Dondattour",
                column: "Emaildangki");

            migrationBuilder.AddForeignKey(
                name: "FK_Dondattour_TaiKhoan_Emaildangki",
                table: "Dondattour",
                column: "Emaildangki",
                principalTable: "TaiKhoan",
                principalColumn: "Emaildangki",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dondattour_TaiKhoan_Emaildangki",
                table: "Dondattour");

            migrationBuilder.DropTable(
                name: "TaiKhoan");

            migrationBuilder.DropIndex(
                name: "IX_Dondattour_Emaildangki",
                table: "Dondattour");

            migrationBuilder.DropColumn(
                name: "Emaildangki",
                table: "Dondattour");
        }
    }
}
