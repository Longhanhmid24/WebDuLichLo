document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("forgotForm");

    if (!form) {
        console.error("Không tìm thấy form với id 'forgotForm'");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;

        if (!email) {
            alert("Vui lòng nhập email.");
            return;
        }

        const formData = new FormData();
        formData.append("email", email); // 👈 Tên key phải đúng y chang bên C#

        try {
            const response = await fetch("https://webdulichlo.onrender.com/api/TaiKhoan/forgot-password", {
                method: "POST",
                body: formData // 👈 Không cần headers, trình duyệt tự động xử lý
            });

            const result = await response.json();
            console.log("Phản hồi từ server:", result);

            if (!response.ok) {
                throw new Error(result?.Message || response.statusText || "Gửi yêu cầu thất bại!");
            }

            alert(result?.Message || "Yêu cầu đặt lại mật khẩu đã được gửi!");

            const token = result?.token; // chữ thường!
            if (token) {
                window.location.href = `reset-password.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
            }

        } catch (error) {
            alert(error.message || "Có lỗi xảy ra khi gửi yêu cầu.");
        }
    });
});
