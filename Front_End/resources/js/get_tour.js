document.addEventListener("DOMContentLoaded", function () {
    // ⚡ BƯỚC TỐI ƯU CỰC NHANH: Hiển thị ngay tour từ Cache trong bộ nhớ trình duyệt nếu có
    const cachedTours = localStorage.getItem("cached_tours");
    if (cachedTours) {
        try {
            renderTours(JSON.parse(cachedTours));
        } catch (e) {
            console.warn("Lỗi đọc cache tour:", e);
        }
    }
    // Tải dữ liệu mới nhất ngầm từ Server
    fetchTours();
});

async function fetchTours() {
    try {
        let response = await fetch("https://webdulichlo.onrender.com/api/Tour/get-tour");

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour nhận được:", tours);

        // Lưu vào cache để lần sau load siêu tốc 0.01 giây
        localStorage.setItem("cached_tours", JSON.stringify(tours));

        // Gọi hàm render có phân quyền
        renderTours(tours);

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
    }
}
function bookTour(Matour) {
    if (!Matour) {
        console.error("Matour không hợp lệ:", Matour);
        return;
    }
    console.log("matour trong bookTour:", Matour);
    window.location.href = `pay_ment.html?id=${Matour}`;
}
function editTour(matour) {
    if (!matour) return;
    window.location.href = `add-tour.html?id=${matour}`;
}
async function deleteTour(matour) {
    try {
        let response = await fetch(`https://webdulichlo.onrender.com/api/Tour/delete/${matour}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi xóa tour: ${response.status} - ${response.statusText}`);
        }

        let result = await response.json();
        console.log(result.message); // In thông báo từ server

        // Xóa tour khỏi giao diện
        let tourElement = document.getElementById(`tour-${matour}`);
        if (tourElement) {
            tourElement.remove();
        }

        alert("Tour đã được xóa thành công!");
    } catch (error) {
        console.error("Lỗi khi xóa tour:", error);
        alert("Xóa tour thất bại!");
    }
}

// Tối ưu ảnh Cloudinary & Đường dẫn
function optimizeImageUrl(url) {
    if (!url || url.trim() === "") return "/images/default.jpg";
    if (url.includes("res.cloudinary.com") && !url.includes("f_auto")) {
        return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
    }
    if (!url.startsWith("http")) {
        return `https://webdulichlo.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
}

async function searchTours() {
    const keyword = document.getElementById('search-input').value.trim();

    if (!keyword) {
        alert("Vui lòng nhập điểm đến!");
        return;
    }

    try {
        let response = await fetch(`https://webdulichlo.onrender.com/api/Tour/search?keyword=${encodeURIComponent(keyword)}`);

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour tìm kiếm:", tours);

        renderTours(tours);

    } catch (error) {
        console.error("Lỗi khi tìm tour:", error);
    }
}

// Tách riêng hàm render cho dễ tái sử dụng
// Hàm renderTours, phân quyền xóa chỉ admin mới thấy
function renderTours(tours) {
    let tourNgoai = "";
    let tourTrongNuoc = "";

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user && user.phanquyen === "admin";

    tours.forEach(tour => {
        let hinhAnh = optimizeImageUrl(tour.hinhAnh);

        let adminButtons = isAdmin
            ? `
                <button class="btn-edit" onclick="editTour('${tour.matour}')">Sửa Tour</button>
                <button class="btn-delete" style="margin-bottom: 5px;" onclick="deleteTour('${tour.matour}')">Xóa Tour</button>
              `
            : "";

        let tourHTML = `
            <div class="tour-item" id="tour-${tour.matour}">
                <img src="${hinhAnh}" class="card-img-top" alt="${tour.tentour}" loading="lazy" decoding="async"
                     onerror="this.onerror=null; this.src='/images/default.jpg';">
                <div class="card-body">
                    <h5 class="card-title">${tour.tentour}</h5>
                    <p class="card-text">${tour.mota || "Không có mô tả"}</p>
                    <p class="tour-price">${tour.gia ? tour.gia.toLocaleString() : 0} VND</p>
                    ${adminButtons}
                    <button class="btn-book" onclick="bookTour('${tour.matour}')">Đặt vé ngay</button>
                </div>
            </div>
        `;

        if (tour.loaiTour && tour.loaiTour.toLowerCase().includes("ngoài")) {
            tourNgoai += tourHTML;
        } else {
            tourTrongNuoc += tourHTML;
        }
    });

    const elemNgoai = document.getElementById("tour-list-ngoai");
    const elemTrong = document.getElementById("tour-list-trongnuoc");

    if (elemNgoai) elemNgoai.innerHTML = tourNgoai;
    if (elemTrong) elemTrong.innerHTML = tourTrongNuoc;
}
