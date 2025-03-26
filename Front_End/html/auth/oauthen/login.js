    //Xử lý đăng nhập (Login)
    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("loginForm").addEventListener("submit", async function (event) {
            event.preventDefault(); // Ngăn form reload trang
    
            const email = document.getElementById("Emaildangki").value.trim();
            const password = document.getElementById("Matkhau").value.trim();
    
            if (!email || !password) {
                alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
                return;
            }
    
            // Tạo FormData để gửi request kiểu Form-Data
            const formData = new FormData();
            formData.append("emaildangki", email); // Đúng tên tham số API yêu cầu
            formData.append("matkhau", password);
    
            try {
                const response = await fetch("https://localhost:7265/api/TaiKhoan/login", {
                    method: "POST",
                    body: formData
                });
    
                // Kiểm tra nếu phản hồi không phải JSON hợp lệ
                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.Message || "Đăng nhập thất bại!");
                }
    
   
    
                alert("Đăng nhập thành công!");
                window.location.href = "../../index.html"; // Điều hướng đến index.html
    
            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                alert(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
            }
        });
    });
    