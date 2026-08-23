document.addEventListener("DOMContentLoaded", function () {
    // Xử lý sự kiện đăng nhập
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Ngăn form reload trang

            const email = document.getElementById("Emaildangki").value.trim();
            const password = document.getElementById("Matkhau").value.trim();

            if (!email || !password) {
                alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
                return;
            }

            const submitBtn = loginForm.querySelector("button[type='submit']") || loginForm.querySelector("button");

            const formData = new FormData();
            formData.append("emaildangki", email);
            formData.append("matkhau", password);

            if (typeof window.showLoading === "function") window.showLoading("Đang đăng nhập, vui lòng chờ...");
            if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, true, "Đang đăng nhập...");

            try {
                const response = await fetch("https://webdulichlo.onrender.com/api/TaiKhoan/login", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.Message || "Đăng nhập thất bại!");
                }

                const result = await response.json();

                // Lưu user vào localStorage
                localStorage.setItem("user", JSON.stringify({
                    email: email,
                    tendangnhap: result.tendangnhap || result.Tendangnhap,
                    phanquyen: result.phanquyen || result.Phanquyen,
                    hinhAnh: result.hinhAnh || result.HinhAnh || ""
                }));

                if (result.token) {
                    localStorage.setItem("jwtToken", result.token);
                }

                if (typeof window.updateHeaderUserUI === "function") {
                    window.updateHeaderUserUI();
                }

                alert("Đăng nhập thành công!");
                window.location.href = "../../index.html"; // Điều hướng về trang chủ
            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
            } finally {
                if (typeof window.hideLoading === "function") window.hideLoading();
                if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, false);
            }
        });
    }

    // Cập nhật giao diện Header User
    if (typeof window.updateHeaderUserUI === "function") {
        window.updateHeaderUserUI();
    }

    // Xử lý đăng nhập bằng Google
    const googleBtn = document.getElementById("google-login-btn") || document.querySelector("a[href*='google-login']");
    if (googleBtn) {
        googleBtn.addEventListener("click", function (event) {
            event.preventDefault();
            const baseUrl = window.API_BASE_URL || "https://webdulichlo.onrender.com";
            window.location.href = baseUrl + "/api/TaiKhoan/google-login";
        });
    }
});