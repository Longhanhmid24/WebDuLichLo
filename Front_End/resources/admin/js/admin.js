document.addEventListener("DOMContentLoaded", function () {
    // Hàm toggle Sidebar
    function toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("show");
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
    document.querySelector(".close-btn").addEventListener("click", toggleSidebar);
    document.querySelector(".icon[onclick='toggleFullscreen()']").addEventListener("click", toggleFullscreen);
    document.querySelector(".icon[onclick='toggleDarkMode()']").addEventListener("click", toggleDarkMode);
});
