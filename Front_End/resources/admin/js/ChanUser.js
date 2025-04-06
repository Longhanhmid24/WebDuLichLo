document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.phanquyen !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "index.html"; // Hoặc trang bạn muốn chuyển hướng
    }
});
