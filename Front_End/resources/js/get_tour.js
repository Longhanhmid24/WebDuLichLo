/* =============================================================
   GET_TOUR.JS — Danh sách tour + Tìm kiếm + Phân quyền Admin
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

// ── Lấy danh sách tour ──
async function fetchTours() {
    try {
        var response = await fetch(window.API_BASE_URL + "/api/Tour/get-tour");
        if (!response.ok) {
            throw new Error("Lỗi API: " + response.status + " - " + response.statusText);
        }

        var tours = await response.json();
        renderTours(tours);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
    }
}

// ── Đặt vé ──
function bookTour(matour) {
    if (!matour) {
        console.error("Matour không hợp lệ:", matour);
        return;
    }
    window.location.href = "pay_ment.html?id=" + matour;
}

// ── Sửa tour (Admin) ──
function editTour(matour) {
    if (!matour) return;
    window.location.href = "add-tour.html?id=" + matour;
}

// ── Xóa tour (Admin, cần Auth Token) ──
async function deleteTour(matour) {
    if (!confirm("Bạn có chắc chắn muốn xóa tour này?")) return;

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/Tour/delete/" + matour, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Lỗi khi xóa tour: " + response.status);
        }

        var result = await response.json();
        console.log(result.message);

        var tourElement = document.getElementById("tour-" + matour);
        if (tourElement) {
            tourElement.remove();
        }

        alert("Tour đã được xóa thành công!");
    } catch (error) {
        console.error("Lỗi khi xóa tour:", error);
        alert("Có lỗi xảy ra khi xóa tour.");
    }
}

// ── Tìm kiếm tour ──
async function searchTours() {
    var keyword = document.getElementById("search-input").value.trim();
    if (!keyword) {
        alert("Vui lòng nhập điểm đến!");
        return;
    }

    try {
        var response = await fetch(window.API_BASE_URL + "/api/Tour/search?keyword=" + encodeURIComponent(keyword));
        if (!response.ok) {
            throw new Error("Lỗi API: " + response.status);
        }

        var tours = await response.json();
        renderTours(tours);
    } catch (error) {
        console.error("Lỗi khi tìm tour:", error);
    }
}

// ── Render danh sách tour (phân quyền Admin) ──
function renderTours(tours) {
    var tourNgoai = "";
    var tourTrongNuoc = "";

    var user = JSON.parse(localStorage.getItem("user"));
    var isAdmin = user && (user.phanquyen || "").toLowerCase() === "admin";

    tours.forEach(function (tour) {
        var hinhAnh = window.resolveImageUrl(tour.hinhAnh);
        var safeStr = window.escapeHtml || function (s) { return s; };

        var adminButtons = isAdmin
            ? '<button class="btn-edit" onclick="editTour(\'' + tour.matour + "')\">" + "Sửa Tour</button>" +
              '<button class="btn-delete" style="margin-bottom: 5px;" onclick="deleteTour(\'' + tour.matour + "')\">" + "Xóa Tour</button>"
            : "";

        var tourHTML =
            '<div class="tour-item" id="tour-' + tour.matour + '">' +
            '  <img src="' + hinhAnh + '" class="card-img-top" alt="' + safeStr(tour.tentour) + '"' +
            "       onerror=\"this.onerror=null; this.src='/images/default.jpg';\">" +
            '  <div class="card-body">' +
            '    <h5 class="card-title">' + safeStr(tour.tentour) + "</h5>" +
            '    <p class="card-text">' + safeStr(tour.mota || "Không có mô tả") + "</p>" +
            '    <p class="tour-price">' + (tour.gia ? tour.gia.toLocaleString("vi-VN") : "0") + " VNĐ</p>" +
            adminButtons +
            '    <button class="btn-book" onclick="bookTour(\'' + tour.matour + "')\">Đặt vé ngay</button>" +
            "  </div>" +
            "</div>";

        if (tour.loaiTour && tour.loaiTour.toLowerCase().includes("ngoài")) {
            tourNgoai += tourHTML;
        } else {
            tourTrongNuoc += tourHTML;
        }
    });

    var listNgoai = document.getElementById("tour-list-ngoai");
    var listTrongNuoc = document.getElementById("tour-list-trongnuoc");
    if (listNgoai) listNgoai.innerHTML = tourNgoai;
    if (listTrongNuoc) listTrongNuoc.innerHTML = tourTrongNuoc;
}

// ── Khởi chạy ──
fetchTours();
