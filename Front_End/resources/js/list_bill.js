// Hàm lấy danh sách đơn đặt tour từ server dựa trên email người dùng
async function fetchOrdersFromServer() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        alert("Không tìm thấy email người dùng.");
        return;
    }

    try {
        const response = await fetch(`https://localhost:7265/api/Dondattour/get-orders?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error("Lỗi khi lấy danh sách đơn đặt tour.");
        }

        const orders = await response.json();
        console.log("Danh sách đơn đặt tour:", orders);

        displayOrders(orders, email);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn đặt tour:", error);
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

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');
        orderElement.innerHTML = `
            <h4>Đơn đặt tour #${order.madon}</h4>
            <p><strong>Tên tour:</strong> ${order.tour.tentour}</p>
            <p><strong>Số người:</strong> ${order.songuoi}</p>
            <p><strong>Tổng tiền:</strong> ${order.tongtien.toLocaleString()} VND</p>
            <p><strong>Ngày đặt:</strong> ${new Date(order.ngaydat).toLocaleDateString()}</p>
            <button onclick="viewBill(${order.tour.matour}, '${email}', ${order.songuoi}, ${order.tongtien})">Xem hóa đơn</button>
            <button onclick="deleteOrder(${order.madon}, '${email}')">Xóa</button>
        `;
        ordersContainer.appendChild(orderElement);
    });
}

// Hàm xóa đơn đặt tour
async function deleteOrder(madon, email) {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;

    try {
        const response = await fetch(`https://localhost:7265/api/Dondattour/delete-order/${madon}`, {
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
