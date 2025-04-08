document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    // Xử lý sự kiện submit form đăng ký
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Lấy giá trị từ các trường nhập liệu
        const email = document.getElementById("Emaildangki").value;
        const tendangnhap = document.getElementById("Tendangnhap").value;
        const matkhau = document.getElementById("Matkhau").value;
        const matkhauXacNhan = document.getElementById("MatkhauXacNhan").value;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp nhau không
        if (matkhau !== matkhauXacNhan) {
            alert('Mật khẩu và xác nhận mật khẩu không khớp!');
            return; // Ngăn chặn gửi form nếu mật khẩu không khớp
        }

        // Tạo đối tượng FormData để gửi dữ liệu
        const formData = new FormData();
        formData.append("emaildangki", email);
        formData.append("tendangnhap", tendangnhap);
        formData.append("matkhau", matkhau);

        try {
            // Gửi yêu cầu đăng ký đến API
            const response = await fetch("https://localhost:7265/api/TaiKhoan/register", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert("Đăng ký thành công! Hãy đăng nhập.");
                window.location.href = "login.html"; // Chuyển hướng sau khi đăng ký
            } else {
                alert(result.Message || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    });

    // Xử lý đăng nhập bằng Google
    document.querySelector("a[href='/api/auth/google']").addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "https://localhost:7265/api/TaiKhoan/google-login"; // Chuyển hướng tới API Google
    });
});