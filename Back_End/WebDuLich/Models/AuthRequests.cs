namespace WebDuLich.Models
{
    public class RegisterRequest
    {
        public string Emaildangki { get; set; } = string.Empty;
        public string Tendangnhap { get; set; } = string.Empty;
        public string? Matkhau { get; set; }
    }

    public class LoginRequest
    {
        public string Emaildangki { get; set; } = string.Empty;
        public string Matkhau { get; set; } = string.Empty;
    }
}
