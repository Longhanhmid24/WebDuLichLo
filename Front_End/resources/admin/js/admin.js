document.addEventListener("DOMContentLoaded", function () {
    // Đặt trạng thái mặc định của sidebar là mở
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.add("show");

    // Hàm toggle Sidebar
    function toggleSidebar() {
        if (sidebar.classList.contains("show")) {
            sidebar.classList.remove("show"); // Ẩn sidebar
        } else {
            sidebar.classList.add("show"); // Hiện sidebar
        }
    }

    // Hàm ẩn Sidebar
    function closeSidebar() {
        sidebar.classList.remove("show");
    }

    // Hàm toggle Fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Lỗi kích hoạt fullscreen: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Hàm toggle Dark Mode
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
    }

    // Lắng nghe sự kiện click
    document.querySelector(".menu-button").addEventListener("click", toggleSidebar);
    document.querySelector(".close-btn").addEventListener("click", closeSidebar);
    document.querySelector(".icon[onclick='toggleFullscreen()']").addEventListener("click", toggleFullscreen);
    document.querySelector(".icon[onclick='toggleDarkMode()']").addEventListener("click", toggleDarkMode);
});