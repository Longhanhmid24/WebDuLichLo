using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebDuLich.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTrangthaiFromDondattour : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Trangthai",
                table: "Dondattour");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Trangthai",
                table: "Dondattour",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
