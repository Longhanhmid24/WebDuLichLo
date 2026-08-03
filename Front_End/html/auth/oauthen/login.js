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
                    tendangnhap: result.tendangnhap,
                    phanquyen: result.phanquyen,
                    hinhAnh: result.hinhAnh || ""
                }));

                if (result.token) {
                    localStorage.setItem("jwtToken", result.token);
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

    // Kiểm tra user đã đăng nhập chưa
    const userName = document.getElementById("user-name");
    const userInfo = document.getElementById("user-info");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        userName.textContent = user.tendangnhap || user.email;

        // Cập nhật Avatar và Tên đăng nhập trên Header từ API nếu chưa đủ
        const headerAvatar = document.querySelector(".account-icon img");
        const baseUrl = "https://webdulichlo.onrender.com";

        // Xóa sạch base64 hỏng nếu lỡ lưu trước đó trong localStorage
        if (user.hinhAnh && user.hinhAnh.startsWith("data:")) {
            delete user.hinhAnh;
            localStorage.setItem("user", JSON.stringify(user));
        }

        if (user.hinhAnh && user.hinhAnh.startsWith("http")) {
            if (headerAvatar) {
                headerAvatar.src = user.hinhAnh;
            }
        }

        // Tự động đồng bộ với Backend API để lấy URL Cloudinary mới nhất
        if (!user.tendangnhap || !user.hinhAnh || !user.hinhAnh.startsWith("http")) {
            fetch(`https://webdulichlo.onrender.com/api/TaiKhoan/info/${encodeURIComponent(user.email)}`)
                .then(res => res.ok ? res.json() : null)
                .then(userData => {
                    if (userData) {
                        if (userData.tendangnhap) {
                            user.tendangnhap = userData.tendangnhap;
                            userName.textContent = userData.tendangnhap;
                        }
                        if (userData.hinhAnh && userData.hinhAnh.startsWith("http")) {
                            user.hinhAnh = userData.hinhAnh;
                            if (headerAvatar) headerAvatar.src = userData.hinhAnh;
                        } else if (headerAvatar) {
                            headerAvatar.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                        }
                        localStorage.setItem("user", JSON.stringify(user));
                    }
                })
                .catch(err => console.error("Lỗi tải thông tin user header:", err));
        }

        let html = `
        <a href="#" id="logout">Đăng xuất</a>
        <a href="ThongTinCaNhan.html?email=${user.email}" id="Profile">Hồ Sơ</a>
    `;

        // Nếu quyền là Admin thì hiển thị quản lý người dùng
        if (user.phanquyen === "admin") {
            html += `<a href="admin.html" id="admin">Quản Lý Người Dùng</a>`;
        }

        userInfo.innerHTML = html;

        document.getElementById("logout").addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("user");
            localStorage.removeItem("jwtToken");
            window.location.href = "../../index.html";
        });
    }

    // Xử lý đăng nhập bằng Google
    const googleBtn = document.getElementById("google-login-btn") || document.querySelector("a[href*='google-login']");
    if (googleBtn) {
        googleBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "https://webdulichlo.onrender.com/api/TaiKhoan/google-login"; // Chuyển hướng tới API Google
        });
    }
});