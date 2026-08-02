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
        userName.textContent = user.email;

        // Cập nhật Avatar trên Header nếu có
        const headerAvatar = document.querySelector(".account-icon img");
        if (headerAvatar) {
            const baseUrl = "https://webdulichlo.onrender.com";
            if (user.hinhAnh && user.hinhAnh.trim() !== "") {
                headerAvatar.src = user.hinhAnh.startsWith("http")
                    ? user.hinhAnh
                    : `${baseUrl}${user.hinhAnh.startsWith("/") ? "" : "/"}${user.hinhAnh}`;
            } else {
                fetch(`https://webdulichlo.onrender.com/api/TaiKhoan/info/${encodeURIComponent(user.email)}`)
                    .then(res => res.ok ? res.json() : null)
                    .then(userData => {
                        if (userData && userData.hinhAnh && userData.hinhAnh.trim() !== "") {
                            user.hinhAnh = userData.hinhAnh;
                            localStorage.setItem("user", JSON.stringify(user));
                            headerAvatar.src = userData.hinhAnh.startsWith("http")
                                ? userData.hinhAnh
                                : `${baseUrl}${userData.hinhAnh.startsWith("/") ? "" : "/"}${userData.hinhAnh}`;
                        }
                    })
                    .catch(err => console.error("Lỗi tải avatar header:", err));
            }
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
            window.location.href = "/index.html";
        });
    }

    // Xử lý đăng nhập bằng Google
    const googleBtn = document.querySelector("a[href='/api/auth/google']");
    if (googleBtn) {
        googleBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "https://webdulichlo.onrender.com/api/TaiKhoan/google-login"; // Chuyển hướng tới API Google
        });
    }
});