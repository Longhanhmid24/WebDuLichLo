/* =============================================================
   BILL.JS — Trang hóa đơn
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

async function fetchBillDetails() {
    var urlParams = new URLSearchParams(window.location.search);
    var matour = urlParams.get("matour");
    var email = urlParams.get("email");

    if (!matour || !email) {
        alert("Không tìm thấy thông tin tour hoặc người dùng.");
        return;
    }

    try {
        var response = await fetch(window.API_BASE_URL + "/api/Tour/get-tour");
        if (!response.ok) {
            throw new Error("Lỗi khi lấy thông tin tour.");
        }

        var tours = await response.json();
        var tour = tours.find(function (t) { return t.matour == matour; });

        if (!tour) {
            console.error("Không tìm thấy tour với matour:", matour);
            return;
        }

        // Hiển thị thông tin tour trên hóa đơn
        document.getElementById("tour-name").textContent = tour.tentour;
        document.getElementById("tour-description").textContent = tour.mota || "Không có mô tả";
        document.getElementById("tour-start-date").textContent = window.formatDateVN(tour.ngayKhoiHanh);
        document.getElementById("tour-end-date").textContent = window.formatDateVN(tour.ngayKetThuc);

        // Lấy thông tin người đặt tour
        var order = JSON.parse(localStorage.getItem("order"));
        if (order) {
            document.getElementById("total-people").textContent = order.songuoi;
            document.getElementById("total-amount").textContent = order.tongtien ? order.tongtien.toLocaleString("vi-VN") : "0";
            document.getElementById("totalPrice").textContent = order.tongtien ? order.tongtien.toLocaleString("vi-VN") : "0";
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
        alert("Không thể lấy thông tin hóa đơn.");
    }
}

// Gọi hàm khi trang được tải
fetchBillDetails();

// Nút xem danh sách đơn đã đặt
var viewOrdersBtn = document.getElementById("view-orders-btn");
if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener("click", function () {
        var urlParams = new URLSearchParams(window.location.search);
        var email = urlParams.get("email");
        if (!email) {
            var userStored = JSON.parse(localStorage.getItem("user"));
            email = userStored ? userStored.email : null;
        }

        if (!email) {
            alert("Không có thông tin email người dùng.");
            return;
        }

        window.location.href = "list_bill.html?email=" + encodeURIComponent(email);
    });
}
