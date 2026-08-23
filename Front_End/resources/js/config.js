/* =============================================================
   CONFIG.JS — Cấu hình toàn cục cho toàn bộ Frontend
   Nạp file này ĐẦU TIÊN trước mọi file JS khác.
   ============================================================= */

// ── 1. API Base URL (Chỉ cần sửa 1 nơi duy nhất khi đổi domain) ──
window.API_BASE_URL = "https://webdulichlo.onrender.com";

// ── 2. Hằng số dùng chung ──
window.DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
window.DEFAULT_TOUR_IMAGE = "/images/default.jpg";

// ── 3. Hàm xác thực API duy nhất (Auth Fetch) ──
// Ưu tiên dùng window.fetchWithAuth (nếu đã được scripts.js định nghĩa),
// nếu chưa thì tự đọc JWT Token từ localStorage.
window.getAuthFetch = function () {
    if (typeof window.fetchWithAuth === "function") {
        return window.fetchWithAuth;
    }
    return async function (url, options = {}) {
        const token = localStorage.getItem("jwtToken");
        options.headers = options.headers || {};
        if (token) {
            if (options.headers instanceof Headers) {
                options.headers.set("Authorization", "Bearer " + token);
            } else {
                options.headers["Authorization"] = "Bearer " + token;
            }
        }
        return fetch(url, options);
    };
};

// ── 4. Định dạng ngày tháng tiếng Việt (dùng chung mọi trang) ──
window.formatDateVN = function (dateString) {
    if (!dateString) return "---";
    try {
        var date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch (e) {
        return dateString;
    }
};

// ── 5. Xử lý đường dẫn hình ảnh (dùng chung) ──
window.resolveImageUrl = function (imagePath, fallback) {
    if (!imagePath || imagePath.trim() === "") {
        return fallback || window.DEFAULT_TOUR_IMAGE;
    }
    if (imagePath.startsWith("http")) {
        return imagePath;
    }
    return window.API_BASE_URL + "/" + imagePath.replace(/^\/+/, "");
};
