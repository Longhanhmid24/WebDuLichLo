document.addEventListener("DOMContentLoaded", function () {
    function toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("show");
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
    }

    document.querySelector(".menu-button").addEventListener("click", toggleSidebar);
    document.querySelector(".close-btn").addEventListener("click", toggleSidebar);
    document.querySelector(".icon[onclick='toggleFullscreen()']").addEventListener("click", toggleFullscreen);
    document.querySelector(".icon[onclick='toggleDarkMode()']").addEventListener("click", toggleDarkMode);
});