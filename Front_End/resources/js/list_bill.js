/* =============================================================
   LIST_BILL.JS — Trang danh sách đơn đặt tour
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

// ── Lấy danh sách đơn đặt tour từ Server ──
async function fetchOrdersFromServer() {
    var urlParams = new URLSearchParams(window.location.search);
    var userStored = JSON.parse(localStorage.getItem("user"));
    var email = urlParams.get("email") || (userStored ? userStored.email : null);

    if (!email) {
        alert("Vui lòng đăng nhập để xem lịch sử giao dịch!");
        var R = window.SITE_ROOT || "";
        window.location.href = R + "html/auth/login.html";
        return;
    }

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/Dondattour/get-orders?email=" + encodeURIComponent(email));
        if (!response.ok) {
            throw new Error("Phiên làm việc hết hạn hoặc không thể tải đơn hàng. Vui lòng đăng nhập lại!");
        }

        var orders = await response.json();
        displayOrders(orders, email);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn đặt tour:", error);
        alert(error.message);
    }
}

// ── Hiển thị danh sách đơn đặt tour lên giao diện ──
function displayOrders(orders, email) {
    var ordersContainer = document.getElementById("orders-container");
    if (!ordersContainer) return;

    ordersContainer.innerHTML = "";
    var safeStr = window.escapeHtml || function (s) { return s; };

    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align:center; color:#64748b; padding:30px;">Bạn chưa có đơn đặt tour nào.</p>';
        return;
    }

    orders.forEach(function (order) {
        var orderElement = document.createElement("div");
        orderElement.classList.add("order-item");

        var tourName = safeStr(order.tour ? order.tour.tentour : "Tour");
        var maDon = safeStr(String(order.madon));
        var emailSafe = safeStr(email || "");
        var ngayDat = order.ngaydat ? window.formatDateVN(order.ngaydat) : "N/A";
        var tongTien = order.tongtien ? order.tongtien.toLocaleString("vi-VN") : "0";

        orderElement.innerHTML =
            "<h4>Đơn đặt tour #" + maDon + "</h4>" +
            "<p><strong>Tên tour:</strong> " + tourName + "</p>" +
            "<p><strong>Số người:</strong> " + order.songuoi + "</p>" +
            "<p><strong>Tổng tiền:</strong> " + tongTien + " VNĐ</p>" +
            "<p><strong>Ngày đặt:</strong> " + ngayDat + "</p>" +
            '<button onclick="viewBill(' + (order.tour ? order.tour.matour : 0) + ", '" + emailSafe + "', " + order.songuoi + ", " + order.tongtien + ')">Xem hóa đơn</button>' +
            '<button onclick="deleteOrder(' + order.madon + ", '" + emailSafe + "'" + ')">Xóa</button>';

        ordersContainer.appendChild(orderElement);
    });
}

// ── Xóa đơn đặt tour ──
async function deleteOrder(madon, email) {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/Dondattour/delete-order/" + madon, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Lỗi khi xóa đơn đặt tour.");
        }

        alert("Đã xóa đơn đặt tour thành công.");
        fetchOrdersFromServer();
    } catch (error) {
        console.error("Lỗi khi xóa đơn đặt tour:", error);
        alert(error.message || "Có lỗi xảy ra khi xóa đơn.");
    }
}

// ── Chuyển hướng sang trang hóa đơn ──
function viewBill(matour, email, songuoi, tongtien) {
    var orderData = { matour: matour, songuoi: songuoi, tongtien: tongtien };
    localStorage.setItem("order", JSON.stringify(orderData));
    window.location.href = "bill.html?matour=" + matour + "&email=" + encodeURIComponent(email);
}

// ── Gọi hàm khi trang được load ──
document.addEventListener("DOMContentLoaded", function () {
    fetchOrdersFromServer();
});
