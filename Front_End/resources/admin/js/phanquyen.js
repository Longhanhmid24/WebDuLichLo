// User Management Functions
document.addEventListener("DOMContentLoaded", fetchUsers);

async function fetchUsers() {
    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc("https://webdulichlo.onrender.com/api/TaiKhoan");
        if (!response.ok) {
            throw new Error("Không thể tải danh sách tài khoản hoặc bạn không có quyền Admin!");
        }
        const users = await response.json();
        renderUserList(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        alert(error.message || "Error loading user data");
    }
}

function renderUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const safeStr = window.escapeHtml || (s => s);

    users.forEach(user => {
        const row = document.createElement("tr");
        const emailSafe = safeStr(user.emaildangki);
        const nameSafe = safeStr(user.tendangnhap || 'N/A');
        const phoneSafe = safeStr(user.sodienthoai || 'N/A');
        const addressSafe = safeStr(user.diachi || 'N/A');

        row.innerHTML = `
            <td data-label="Ảnh Đại Diện">${user.hinhAnh ? `<img src="${safeStr(user.hinhAnh)}" width="40" height="40" style="border-radius: 50%;">` : 'N/A'}</td>
            <td data-label="Email">${emailSafe}</td>
            <td data-label="Tên Đăng Nhập">${nameSafe}</td>
            <td data-label="Quyền">
                <select onchange="updateUserRole('${emailSafe}', this.value)">
                    <option value="Admin" ${user.phanquyen === 'Admin' || user.phanquyen === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="User" ${user.phanquyen === 'User' || user.phanquyen === 'user' ? 'selected' : ''}>User</option>
                </select>
            </td>
            <td data-label="Số điện thoại">${phoneSafe}</td>
            <td data-label="Địa chỉ">${addressSafe}</td>
            <td data-label="Giới Tính">${safeStr(formatGender(user.gioitinh))}</td>
            <td data-label="Ngày Tạo">${formatDate(user.ngayTao)}</td>
            <td data-label="Hành Động"><button class="btn btn-danger btn-sm" onclick="deleteUser('${emailSafe}')">Xóa</button></td>
        `;
        userList.appendChild(row);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatGender(gender) {
    if (!gender) return 'N/A';

    // Chuyển đổi các giá trị phổ biến
    gender = gender.toLowerCase().trim();

    switch (gender) {
        case 'nam':
        case 'male':
        case '1':
            return 'Nam';
        case 'nữ':
        case 'nu':
        case 'female':
        case '0':
            return 'Nữ';
        case 'khác':
        case 'other':
        case '2':
            return 'Khác';
        default:
            return gender;
    }
}

async function updateUserRole(email, role) {
    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `phanquyen=${encodeURIComponent(role)}`
        });

        if (response.ok) {
            alert("Cập nhật quyền thành công");
            fetchUsers();
        } else {
            throw new Error("Cập nhật quyền thất bại (Bạn cần có quyền Admin!)");
        }
    } catch (error) {
        console.error("Error updating role:", error);
        alert(error.message || "Error updating user role");
    }
}

async function deleteUser(email) {
    if (!confirm("Confirm deletion?")) return;

    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/${encodeURIComponent(email)}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("User deleted");
            fetchUsers();
        } else {
            throw new Error("Failed to delete user");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
    }
}


