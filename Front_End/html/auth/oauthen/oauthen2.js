document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    // Xử lý sự kiện submit form đăng ký
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("emaildangki", document.getElementById("Emaildangki").value);
        formData.append("tendangnhap", document.getElementById("Tendangnhap").value);
        formData.append("matkhau", document.getElementById("Matkhau").value);

        try {
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