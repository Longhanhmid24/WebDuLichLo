document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = (user && user.phanquyen) ? user.phanquyen.toLowerCase() : "";
    if (!user || role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "index.html"; // Hoặc trang bạn muốn chuyển hướng
    }
});

