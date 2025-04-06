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
                    tendangnhap: result.tendangnhap,
                    phanquyen: result.phanquyen // ← THÊM DÒNG NÀY
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
    userName.textContent = user.email;

    let html = `
        <a href="#" id="logout">Đăng xuất</a>
        <a href="ThongTinCaNhan.html?email=${user.email}" id="Profile">Hồ Sơ</a>
    `;

    // Nếu quyền là Admin thì hiển thị quản lý người dùng
    if (user.phanquyen === "admin") {
        html += `<a href="admin.html" id="admin">Quản Lý Người Dùng</a>`;
    }

    userInfo.innerHTML = html;

    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("user");
        location.reload();
    });
}
});