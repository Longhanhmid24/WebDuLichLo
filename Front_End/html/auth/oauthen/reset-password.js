document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("resetPasswordForm");

    // Lấy token và email từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const token = urlParams.get("token");

    if (!email || !token) {
        alert("Thiếu thông tin token hoặc email!");
        window.location.href = "login.html";
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const newPassword = document.getElementById("newPassword").value.trim();

        if (!newPassword) {
            alert("Vui lòng nhập mật khẩu mới!");
            return;
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("token", token);
        formData.append("newPassword", newPassword);

        try {
            const response = await fetch("https://localhost:7265/api/TaiKhoan/reset-password", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("Phản hồi từ server:", result); // Debug

            if (!response.ok) {
                throw new Error(result?.Message || "Reset mật khẩu thất bại!");
            }

            alert(result?.Message || "Đổi mật khẩu thành công!");
            window.location.href = "login.html"; // Chuyển về đăng nhập sau khi thành công
        } catch (error) {
            console.error("Lỗi reset mật khẩu:", error);
            alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
        }
    });
});
