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

            let tourHTML = `
                <div class="tour-item">
                    <img src="${hinhAnh}" class="card-img-top" alt="${tour.tentour}" 
                         onerror="this.onerror=null; this.src='/images/default.jpg';">
                    <div class="card-body">
                        <h5 class="card-title">${tour.tentour}</h5>
                        <p class="card-text">${tour.mota || "Không có mô tả"}</p>
                        <p class="tour-price">${tour.gia.toLocaleString()} VND</p>
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

fetchTours();