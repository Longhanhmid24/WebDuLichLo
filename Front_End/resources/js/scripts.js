/* =============================================================
   SCRIPTS.JS — Tiện ích dùng chung cho toàn bộ Frontend
   Yêu cầu: Nạp config.js TRƯỚC file này.
   ============================================================= */

// ── Navbar Toggle (Mobile) ──
document.addEventListener("DOMContentLoaded", function () {
    var navbarToggler = document.querySelector(".navbar-toggler");
    var navbarMenu = document.querySelector("#navbarNav");

    if (navbarToggler && navbarMenu) {
        navbarToggler.addEventListener("click", function () {
            navbarMenu.classList.toggle("collapse");
        });
    }
});

// ── Lịch sử giao dịch — Chuyển hướng (Event Delegation) ──
window.goToOrderHistory = function (e) {
    if (e) e.preventDefault();
    var currentUser = JSON.parse(localStorage.getItem("user"));
    var email = currentUser ? currentUser.email : null;

    if (!currentUser || !email) {
        alert("Vui lòng đăng nhập để xem Lịch sử giao dịch!");
        var R = window.SITE_ROOT || "";
        window.location.href = R + "html/auth/login.html";
        return;
    }

    var R2 = window.SITE_ROOT || "";
    window.location.href = R2 + "list_bill.html?email=" + encodeURIComponent(email);
};

document.addEventListener("click", function (e) {
    var btn = e.target.closest(".view-orders-btn");
    if (btn) {
        window.goToOrderHistory(e);
    }
});

// ── Loading Overlay Helpers ──
window.showLoading = function (message) {
    message = message || "Đang xử lý, vui lòng chờ...";
    var overlay = document.getElementById("global-loading-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "global-loading-overlay";
        overlay.innerHTML =
            '<div class="loading-spinner-box">' +
            '  <div class="global-spinner"></div>' +
            '  <div class="loading-text" id="global-loading-text">' + message + "</div>" +
            "</div>";
        document.body.appendChild(overlay);
    } else {
        var textElem = document.getElementById("global-loading-text");
        if (textElem) textElem.textContent = message;
    }
    overlay.offsetHeight; // Force DOM reflow
    overlay.classList.add("show");
};

window.hideLoading = function () {
    var overlay = document.getElementById("global-loading-overlay");
    if (overlay) {
        overlay.classList.remove("show");
    }
};

// ── Button Loading State Helper ──
window.setButtonLoading = function (btn, isLoading, loadingText) {
    if (!btn) return;
    loadingText = loadingText || "Đang xử lý...";
    if (isLoading) {
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.classList.add("btn-loading");
        btn.innerHTML = '<span class="btn-spinner"></span>' + loadingText;
    } else {
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
            delete btn.dataset.originalHtml;
        }
        btn.disabled = false;
        btn.classList.remove("btn-loading");
    }
};

// ── HTML Escape (XSS Prevention) ──
window.escapeHtml = function (str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ── Authenticated Fetch (global) ──
window.fetchWithAuth = async function (url, options) {
    options = options || {};
    var token = localStorage.getItem("jwtToken");
    options.headers = options.headers || {};

    if (token) {
        if (options.headers instanceof Headers) {
            options.headers.set("Authorization", "Bearer " + token);
        } else {
            options.headers["Authorization"] = "Bearer " + token;
        }
    }

    var response = await fetch(url, options);

    if (response.status === 401) {
        console.warn("Phiên đăng nhập hết hạn hoặc chưa xác thực!");
    } else if (response.status === 403) {
        alert("Bạn không có quyền truy cập tính năng này!");
    }

    return response;
};
