// User Management Functions
document.addEventListener("DOMContentLoaded", fetchUsers);

async function fetchUsers() {
    try {
        const response = await fetch("https://localhost:7265/api/TaiKhoan");
        const users = await response.json();
        renderUserList(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error loading user data");
    }
}

function renderUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.hinhAnh || 'N/A'}</td>
            <td>${user.emaildangki}</td>
            <td>${user.tendangnhap || 'N/A'}</td>
            <td>
                <select onchange="updateUserRole('${user.emaildangki}', this.value)">
                    <option value="admin" ${user.phanquyen === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="user" ${user.phanquyen === 'user' ? 'selected' : ''}>User</option>
                    <option value="manager" ${user.phanquyen === 'manager' ? 'selected' : ''}>Manager</option>
                </select>
            </td>
            <td>${user.sodienthoai || 'N/A'}</td>
            <td>${user.diachi || 'N/A'}</td>
            <td>${formatGender(user.gioitinh)}</td>
            <td>${formatDate(user.ngayTao)}</td>
            <td><button onclick="deleteUser('${user.emaildangki}')">Xóa</button></td>
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
    if (!gender) return 'Chưa có';
    
    // Chuyển đổi các giá trị phổ biến
    gender = gender.toLowerCase().trim();
    
    switch(gender) {
        case 'nam':
        case 'male':
        case '1':
            return 'Nam';
        case 'nữ':
        case 'nu':
        case 'nữ':
        case 'female':
        case '0':
            return 'Nữ';
        case 'khác':
        case 'other':
        case '2':
            return 'Khác';
        default:
            return gender; // Giữ nguyên nếu không khớp với các trường hợp trên
    }
}

async function updateUserRole(email, role) {
    try {
        const response = await fetch(`https://localhost:7265/api/TaiKhoan/${email}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `phanquyen=${role}`
        });
        
        if (response.ok) {
            alert("Cập nhật quyền thành công");
            fetchUsers();
        } else {
            throw new Error("Cập nhật quyền thất bại");
        }
    } catch (error) {
        console.error("Error updating role:", error);
        alert("Error updating user role");
    }
}

async function deleteUser(email) {
    if (!confirm("Confirm deletion?")) return;
    
    try {
        const response = await fetch(`https://localhost:7265/api/TaiKhoan/${email}`, {
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