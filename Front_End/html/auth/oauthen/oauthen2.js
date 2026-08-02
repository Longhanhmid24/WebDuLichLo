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

        const submitBtn = registerForm.querySelector("button[type='submit']") || registerForm.querySelector("button");

        // Tạo đối tượng FormData để gửi dữ liệu
        const formData = new FormData();
        formData.append("emaildangki", email);
        formData.append("tendangnhap", tendangnhap);
        formData.append("matkhau", matkhau);

        if (typeof window.showLoading === "function") window.showLoading("Đang đăng ký tài khoản, vui lòng chờ...");
        if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, true, "Đang đăng ký...");

        try {
            // Gửi yêu cầu đăng ký đến API
            const response = await fetch("https://webdulichlo.onrender.com/api/TaiKhoan/register", {
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
        } finally {
            if (typeof window.hideLoading === "function") window.hideLoading();
            if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, false);
        }
    });

});