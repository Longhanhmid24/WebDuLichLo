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

// ── Cập nhật Giao diện Header User (Avatar & Menu) ──
window.updateHeaderUserUI = async function () {
    var user = JSON.parse(localStorage.getItem("user"));
    var headerAvatar = document.querySelector(".account-icon img");
    var userNameElem = document.getElementById("user-name");
    var userInfoElem = document.getElementById("user-info");

    if (!user) {
        if (headerAvatar) headerAvatar.src = window.DEFAULT_AVATAR || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        if (userNameElem) userNameElem.textContent = "";
        if (userInfoElem) {
            var R = window.SITE_ROOT || "";
            userInfoElem.innerHTML =
                '<a href="' + R + 'html/auth/login.html" id="login-link">Đăng nhập</a>' +
                '<a href="' + R + 'html/auth/register.html" id="register-link">Đăng ký</a>';
        }
        return;
    }

    // 1. Cập nhật ngay lập tức từ localStorage
    var hinhAnh = user.hinhAnh || user.HinhAnh;
    var avatarSrc = window.resolveImageUrl ? window.resolveImageUrl(hinhAnh, window.DEFAULT_AVATAR) : (hinhAnh || window.DEFAULT_AVATAR);
    if (headerAvatar) headerAvatar.src = avatarSrc;
    if (userNameElem) userNameElem.textContent = user.tendangnhap || user.email;

    // 2. Render Menu Dropdown
    if (userInfoElem) {
        var R2 = window.SITE_ROOT || "";
        var html = '<a href="#" id="logout-btn-global">Đăng xuất</a>' +
                   '<a href="' + R2 + 'ThongTinCaNhan.html?email=' + encodeURIComponent(user.email) + '" id="Profile">Hồ Sơ</a>';

        var role = (user.phanquyen || "").toLowerCase();
        if (role === "admin") {
            html += '<a href="' + R2 + 'PhanQuyen.html" id="admin">Quản Lý Người Dùng</a>';
        }

        userInfoElem.innerHTML = html;

        var logoutBtn = document.getElementById("logout-btn-global");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("user");
                localStorage.removeItem("jwtToken");
                window.location.href = R2 + "index.html";
            });
        }
    }

    // 3. Tự động đồng bộ ngầm với Backend API (Dùng getAuthFetch có chứa JWT Token)
    try {
        var fetchFunc = window.getAuthFetch ? window.getAuthFetch() : fetch;
        var apiBase = window.API_BASE_URL || "https://webdulichlo.onrender.com";
        var res = await fetchFunc(apiBase + "/api/TaiKhoan/info/" + encodeURIComponent(user.email));

        if (res.ok) {
            var userData = await res.json();
            var updated = false;

            if (userData.tendangnhap && userData.tendangnhap !== user.tendangnhap) {
                user.tendangnhap = userData.tendangnhap;
                if (userNameElem) userNameElem.textContent = userData.tendangnhap;
                updated = true;
            }

            var freshHinhAnh = userData.hinhAnh || userData.HinhAnh;
            if (freshHinhAnh) {
                if (freshHinhAnh !== user.hinhAnh) {
                    user.hinhAnh = freshHinhAnh;
                    updated = true;
                }
                var freshAvatarSrc = window.resolveImageUrl ? window.resolveImageUrl(freshHinhAnh, window.DEFAULT_AVATAR) : freshHinhAnh;
                if (headerAvatar) headerAvatar.src = freshAvatarSrc;
            }

            if (userData.phanquyen && userData.phanquyen !== user.phanquyen) {
                user.phanquyen = userData.phanquyen;
                updated = true;
            }

            if (updated) {
                localStorage.setItem("user", JSON.stringify(user));
            }
        }
    } catch (err) {
        console.warn("Lỗi đồng bộ header user:", err);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.updateHeaderUserUI === "function") {
        window.updateHeaderUserUI();
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
