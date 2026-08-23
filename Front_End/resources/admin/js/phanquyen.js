// User Management Functions
document.addEventListener("DOMContentLoaded", fetchUsers);

function getAuthFetch() {
    if (typeof window.fetchWithAuth === "function") {
        return window.fetchWithAuth;
    }
    return async function (url, options = {}) {
        const token = localStorage.getItem("jwtToken");
        options.headers = options.headers || {};
        if (token) {
            if (options.headers instanceof Headers) {
                options.headers.set("Authorization", `Bearer ${token}`);
            } else {
                options.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return fetch(url, options);
    };
}

async function fetchUsers() {
    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            alert("Không tìm thấy mã xác thực (JWT Token). Vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP lại bằng tài khoản Admin!");
            return;
        }

        const fetchFunc = getAuthFetch();
        const response = await fetchFunc("https://webdulichlo.onrender.com/api/TaiKhoan");

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Không thể tải danh sách tài khoản. Phiên đăng nhập hết hạn hoặc tài khoản không có quyền Admin. Vui lòng đăng nhập lại!");
            }
            const err = await response.json().catch(() => ({}));
            throw new Error(err.Message || `Lỗi tải danh sách người dùng (${response.status})`);
        }

        const users = await response.json();
        renderUserList(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        alert(error.message || "Error loading user data");
    }
}

let globalUsersList = [];

function renderUserList(users) {
    globalUsersList = users;
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
                    <option value="Admin" ${(user.phanquyen || '').toLowerCase() === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="User" ${(user.phanquyen || '').toLowerCase() === 'user' ? 'selected' : ''}>User</option>
                </select>
            </td>
            <td data-label="Số điện thoại">${phoneSafe}</td>
            <td data-label="Địa chỉ">${addressSafe}</td>
            <td data-label="Giới Tính">${safeStr(formatGender(user.gioitinh))}</td>
            <td data-label="Ngày Tạo">${formatDate(user.ngayTao)}</td>
            <td data-label="Hành Động">
                <button class="btn btn-warning btn-sm" style="margin-right: 5px;" onclick="openEditModal('${emailSafe}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${emailSafe}')">Xóa</button>
            </td>
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
        const fetchFunc = getAuthFetch();
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `phanquyen=${encodeURIComponent(role)}`
        });

        if (response.ok) {
            alert("Cập nhật quyền thành công!");
            fetchUsers();
        } else {
            throw new Error("Cập nhật quyền thất bại (Bạn cần có quyền Admin!)");
        }
    } catch (error) {
        console.error("Error updating role:", error);
        alert(error.message || "Error updating user role");
    }
}

function openEditModal(email) {
    const user = globalUsersList.find(u => u.emaildangki === email);
    if (!user) return;

    document.getElementById("editEmail").value = user.emaildangki || "";
    document.getElementById("editTendangnhap").value = user.tendangnhap || "";
    document.getElementById("editMatkhau").value = "";
    document.getElementById("editSodienthoai").value = user.sodienthoai || "";
    document.getElementById("editDiachi").value = user.diachi || "";
    document.getElementById("editGioitinh").value = user.gioitinh || "Nam";
    document.getElementById("editPhanquyen").value = (user.phanquyen || "").toLowerCase() === "admin" ? "Admin" : "User";

    document.getElementById("editUserModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editUserModal").style.display = "none";
}

async function saveUserChanges(event) {
    event.preventDefault();

    const email = document.getElementById("editEmail").value;
    const formData = new URLSearchParams();
    formData.append("tendangnhap", document.getElementById("editTendangnhap").value);
    
    const pass = document.getElementById("editMatkhau").value;
    if (pass) formData.append("matkhau", pass);

    formData.append("sodienthoai", document.getElementById("editSodienthoai").value);
    formData.append("diachi", document.getElementById("editDiachi").value);
    formData.append("gioitinh", document.getElementById("editGioitinh").value);
    formData.append("phanquyen", document.getElementById("editPhanquyen").value);

    try {
        const fetchFunc = getAuthFetch();
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/admin-update/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        if (response.ok) {
            alert("Cập nhật thông tin người dùng thành công!");
            closeEditModal();
            fetchUsers();
        } else {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.Message || "Cập nhật thất bại!");
        }
    } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error);
        alert(error.message || "Lỗi khi cập nhật người dùng");
    }
}

async function deleteUser(email) {
    if (!confirm("Confirm deletion?")) return;

    try {
        const fetchFunc = getAuthFetch();
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


