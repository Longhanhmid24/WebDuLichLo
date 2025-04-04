// UI Control Functions
document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.add("show"); // Default to open
    
    // Logo click handler
    document.querySelector('.badge img').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Fullscreen error:", err);
        });
    } else {
        document.exitFullscreen();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// Initialize dark mode if previously set
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}