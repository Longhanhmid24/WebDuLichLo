async function fetchBillDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const matour = urlParams.get('matour');
    const email = urlParams.get('email');

    if (!matour || !email) {
        alert("Không tìm thấy thông tin tour hoặc người dùng.");
        return;
    }

    try {
        // Lấy thông tin tour từ API
        const response = await fetch("https://localhost:7265/api/Tour/get-tour");
        if (!response.ok) {
            throw new Error("Lỗi khi lấy thông tin tour.");
        }

        const tours = await response.json();
        const tour = tours.find(t => t.matour == matour);

        if (!tour) {
            console.error("Không tìm thấy tour với matour:", matour);
            return;
        }

        // Hiển thị thông tin tour trên hóa đơn
        document.getElementById('tour-name').textContent = tour.tentour;
        document.getElementById('tour-description').textContent = tour.mota || "Không có mô tả";
        document.getElementById('tour-start-date').textContent = tour.ngayKhoiHanh;
        document.getElementById('tour-end-date').textContent = tour.ngayKetThuc;

        // Lấy thông tin người đặt tour
        const order = JSON.parse(localStorage.getItem('order'));
        document.getElementById('total-people').textContent = order.songuoi;
        document.getElementById('total-amount').textContent = order.tongtien.toLocaleString();

        // Hiển thị tổng tiền
        document.getElementById('totalPrice').textContent = order.tongtien.toLocaleString();
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
        alert("Không thể lấy thông tin hóa đơn.");
    }
}

// Gọi hàm để hiển thị thông tin hóa đơn khi trang được tải
fetchBillDetails();

document.getElementById('view-orders-btn').addEventListener('click', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        alert("Không có thông tin email người dùng.");
        return;
    }

    // Chuyển hướng sang list_bill.html kèm theo email
    window.location.href = `list_bill.html?email=${encodeURIComponent(email)}`;
});
