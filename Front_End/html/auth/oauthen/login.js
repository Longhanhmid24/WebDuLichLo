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

            const formData = new FormData();
            formData.append("emaildangki", email);
            formData.append("matkhau", password);

            try {
                const response = await fetch("https://localhost:7265/api/TaiKhoan/login", {
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
                    tendangnhap: result.tendangnhap // Đảm bảo rằng tên này đúng với phản hồi từ API
                }));

                alert("Đăng nhập thành công!");
                window.location.href = "../../index.html"; // Điều hướng về trang chủ
            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
            }
        });
    }

    // Kiểm tra user đã đăng nhập chưa
    const userName = document.getElementById("user-name");
    const userInfo = document.getElementById("user-info");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        // Nếu đã đăng nhập, hiển thị tên user
        userName.textContent = user.email;

        // Thêm nút đăng xuất vào dropdown
        userInfo.innerHTML = `
            <a href="#" id="logout">Đăng xuất</a>
            <a href="admin.html" id="admin">Admin</a>
            <a href="ThongTinCaNhan.html" id="Profile">Profile</a>
        `;
        
        document.getElementById("logout").addEventListener("click", function () {
            localStorage.removeItem("user"); // Xóa user khỏi localStorage
            location.reload(); // Tải lại trang
        });
    }
});