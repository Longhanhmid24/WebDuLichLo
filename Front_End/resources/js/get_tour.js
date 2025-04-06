async function fetchTours() {
    try {
        let response = await fetch("https://localhost:7265/api/Tour/get-tour");

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour nhận được:", tours);

        let tourNgoai = "";
        let tourTrongNuoc = "";

        tours.forEach(tour => {
            console.log(`Tour: ${tour.tentour}, Loại: ${tour.loaiTour}`);

            let hinhAnh = tour.hinhAnh ? tour.hinhAnh : "/images/default.jpg";

            // Thêm id cho mỗi tour để dễ dàng xóa
            let tourHTML = `
                <div class="tour-item" id="tour-${tour.matour}">
                    <img src="${hinhAnh}" class="card-img-top" alt="${tour.tentour}" 
                         onerror="this.onerror=null; this.src='/images/default.jpg';">
                    <div class="card-body">
                        <h5 class="card-title">${tour.tentour}</h5>
                        <p class="card-text">${tour.mota || "Không có mô tả"}</p>
                        <p class="tour-price">${tour.gia.toLocaleString()} VND</p>
                        <button class="btn-delete" onclick="deleteTour('${tour.matour}')">Xóa Tour</button>
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

