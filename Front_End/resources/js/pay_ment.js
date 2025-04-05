function updateTicket(type, change) {
    let input = document.getElementById(type);
    if (input) {
        let value = parseInt(input.value);
        if (value + change >= 0) {
            input.value = value + change;
            calculateTotal();
        }
    } else {
        console.error("Không tìm thấy phần tử có id:", type);
    }
}

async function fetchTourDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const matour = urlParams.get('id'); // Lấy 'id' từ URL

        if (matour) {
            console.log("Matour nhận được:", matour);
            // Thực hiện các hành động tiếp theo
        } else {
            console.error("Không tìm thấy Matour trong URL");
        }

        console.log("matour trong pay_ment.html:", matour);

        let response = await fetch("https://localhost:7265/api/Tour/get-tour");

        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour từ API:", tours);

        const tour = tours.find(t => t.matour == matour);

        if (!tour) {
            console.error("Không tìm thấy tour với matour:", matour);
            document.getElementById('tour-name').textContent = "Không tìm thấy tour";
            return;
        }

        console.log("Thông tin tour chi tiết:", tour);

        document.getElementById('tour-name').textContent = tour.tentour;
        document.getElementById('tour-description').textContent = tour.mota;
        document.getElementById('tour-price-adult').textContent = tour.giaNguoiLon.toLocaleString() + " VND";
        document.getElementById('tour-price-child').textContent = tour.giaTreEm.toLocaleString() + " VND";
        document.getElementById('tour-price-baby').textContent = tour.giaTreNho.toLocaleString() + " VND";
        document.getElementById('tour-start-date').textContent = tour.ngayKhoiHanh;
        document.getElementById('tour-end-date').textContent = tour.ngayKetThuc;
        document.getElementById('tour-seats').textContent = tour.sokhach;
        if (tour.hinhAnh) {
            document.getElementById('tour-image').src = tour.hinhAnh;
        } else {
            document.getElementById('tour-image').src = "/images/default.jpg";
        }
        document.getElementById('tour-image').alt = tour.tentour;

        document.getElementById('tour-image').onerror = function () {
            this.onerror = null;
            this.src = "/images/default.jpg";
        };

        window.tour = tour; // Lưu thông tin tour vào biến toàn cục
        calculateTotal();

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tour chi tiết:", error);
    }
}

function calculateTotal() {
    let adultPrice = parseFloat(document.getElementById('tour-price-adult').textContent.replace(' VND', '').replace(/,/g, ''));
    let childPrice = parseFloat(document.getElementById('tour-price-child').textContent.replace(' VND', '').replace(/,/g, ''));
    let babyPrice = parseFloat(document.getElementById('tour-price-baby').textContent.replace(' VND', '').replace(/,/g, ''));

    let adultCount = parseInt(document.getElementById('adult').value);
    let childCount = parseInt(document.getElementById('child').value);
    let babyCount = parseInt(document.getElementById('baby').value);

    let total = (adultPrice * adultCount) + (childPrice * childCount) + (babyPrice * babyCount);
    document.getElementById('totalPrice').textContent = total.toLocaleString();
}

function processPayment() {
    alert(`Thanh toán thành công cho tour ${window.tour.tentour}!`);
    displayTourDetailsAfterPayment(); // Gọi hàm hiển thị thông tin sau thanh toán
}

function displayTourDetailsAfterPayment() {
    let hinhAnh = tour.hinhAnh && tour.hinhAnh.trim() !== "" ? tour.hinhAnh : "/images/default.jpg";

    if (!hinhAnh.startsWith("http")) {
        hinhAnh = `https://localhost:7265/${hinhAnh.replace(/^\/+/, '')}`;
    }
    let tourDetailsHTML = `
        <div class="tour-details">
                    <img src="${hinhAnh}" class="card-img-top" alt="${window.tour.hinhAnh}" 
                 onerror="this.onerror=null; this.src='/images/default.jpg';">
            <h2>Thông tin tour đã đặt</h2>
            <h3>${window.tour.tentour}</h3>
            <p>Mô tả: ${window.tour.mota || "Không có mô tả"}</p>
            <p>Giá: ${window.tour.gia.toLocaleString()} VND</p>

            <p>Ngày khởi hành: ${window.tour.ngayKhoiHanh}</p>
            <p>Ngày kết thúc: ${window.tour.ngayKetThuc}</p>
            <p>Số khách: ${window.tour.sokhach}</p>
        </div>
    `;
    document.getElementById('tour-details-container').innerHTML = tourDetailsHTML;
}

fetchTourDetail();

