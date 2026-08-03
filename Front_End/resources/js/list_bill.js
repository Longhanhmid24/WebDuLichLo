// Hàm lấy danh sách đơn đặt tour từ server dựa trên email người dùng
async function fetchOrdersFromServer() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/Dondattour/get-orders?email=${encodeURIComponent(email || "")}`);
        if (!response.ok) {
            throw new Error("Vui lòng đăng nhập để xem danh sách đơn đặt tour.");
        }

        const orders = await response.json();
        console.log("Danh sách đơn đặt tour:", orders);

        displayOrders(orders, email);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn đặt tour:", error);
        alert(error.message);
    }
}

// Hiển thị danh sách đơn đặt tour lên giao diện
function displayOrders(orders, email) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) {
        console.error('Không tìm thấy phần tử với id "orders-container"');
        return;
    }

    ordersContainer.innerHTML = ""; // Xóa nội dung cũ
    const safeStr = window.escapeHtml || (s => s);

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');
        const tourNameSafe = safeStr(order.tour ? order.tour.tentour : "Tour");
        const maDonSafe = safeStr(order.madon);
        const emailSafe = safeStr(email || "");

        orderElement.innerHTML = `
            <h4>Đơn đặt tour #${maDonSafe}</h4>
            <p><strong>Tên tour:</strong> ${tourNameSafe}</p>
            <p><strong>Số người:</strong> ${order.songuoi}</p>
            <p><strong>Tổng tiền:</strong> ${order.tongtien ? order.tongtien.toLocaleString() : 0} VND</p>
            <p><strong>Ngày đặt:</strong> ${order.ngaydat ? new Date(order.ngaydat).toLocaleDateString() : 'N/A'}</p>
            <button onclick="viewBill(${order.tour ? order.tour.matour : 0}, '${emailSafe}', ${order.songuoi}, ${order.tongtien})">Xem hóa đơn</button>
            <button onclick="deleteOrder(${order.madon}, '${emailSafe}')">Xóa</button>
        `;
        ordersContainer.appendChild(orderElement);
    });
}

// Hàm xóa đơn đặt tour
async function deleteOrder(madon, email) {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;

    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/Dondattour/delete-order/${madon}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Lỗi khi xóa đơn đặt tour.");
        }

        console.log("Đã xóa đơn đặt tour thành công.");
        // Cập nhật lại danh sách sau khi xóa
        fetchOrdersFromServer();

    } catch (error) {
        console.error("Lỗi khi xóa đơn đặt tour:", error);
    }
}

// Chuyển hướng sang trang hóa đơn (bill.html) và truyền dữ liệu cần thiết
function viewBill(matour, email, songuoi, tongtien) {
    // Lưu đơn vào localStorage để bill.html dùng
    const orderData = { matour, songuoi, tongtien };
    localStorage.setItem('order', JSON.stringify(orderData));

    // Chuyển hướng
    window.location.href = `bill.html?matour=${matour}&email=${encodeURIComponent(email)}`;
}

// Gọi hàm khi trang được load
document.addEventListener('DOMContentLoaded', function () {
    fetchOrdersFromServer();
});
