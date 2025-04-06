async function fetchTours() {
    try {
        let response = await fetch("https://localhost:7265/api/Tour/get-tour");

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour nhận được:", tours);

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
async function deleteTour(matour) {
    try {
        let response = await fetch(`https://localhost:7265/api/Tour/delete/${matour}`, {
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
        alert("Có lỗi xảy ra khi xóa tour.");
    }
}
fetchTours();
async function searchTours() {
    const keyword = document.getElementById('search-input').value.trim();

    if (!keyword) {
        alert("Vui lòng nhập điểm đến!");
        return;
    }

    try {
        let response = await fetch(`https://localhost:7265/api/Tour/search?keyword=${encodeURIComponent(keyword)}`);

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
        let hinhAnh = tour.hinhAnh && tour.hinhAnh.startsWith("http")
            ? tour.hinhAnh
            : tour.hinhAnh
                ? `https://localhost:7265${tour.hinhAnh}`
                : "/images/default.jpg";

        let deleteButton = isAdmin
            ? `<button class="btn-delete" onclick="deleteTour('${tour.matour}')">Xóa Tour</button>`
            : "";

        let tourHTML = `
            <div class="tour-item" id="tour-${tour.matour}">
                <img src="${hinhAnh}" class="card-img-top" alt="${tour.tentour}" 
                     onerror="this.onerror=null; this.src='/images/default.jpg';">
                <div class="card-body">
                    <h5 class="card-title">${tour.tentour}</h5>
                    <p class="card-text">${tour.mota || "Không có mô tả"}</p>
                    <p class="tour-price">${tour.gia.toLocaleString()} VND</p>
                    ${deleteButton}
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

    document.getElementById("tour-list-ngoai").innerHTML = tourNgoai;
    document.getElementById("tour-list-trongnuoc").innerHTML = tourTrongNuoc;
}
