/* =============================================================
   PHANQUYEN.JS — Quản lý người dùng (Admin)
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

document.addEventListener("DOMContentLoaded", fetchUsers);

var globalUsersList = [];

// ── Lấy danh sách người dùng ──
async function fetchUsers() {
    var token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Không tìm thấy mã xác thực (JWT Token). Vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP lại bằng tài khoản Admin!");
        return;
    }

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan");

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Phiên đăng nhập hết hạn hoặc tài khoản không có quyền Admin. Vui lòng đăng nhập lại!");
            }
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.Message || "Lỗi tải danh sách người dùng (" + response.status + ")");
        }

        var users = await response.json();
        renderUserList(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        alert(error.message || "Error loading user data");
    }
}

// ── Render danh sách người dùng ──
function renderUserList(users) {
    globalUsersList = users;
    var userList = document.getElementById("userList");
    if (!userList) return;
    userList.innerHTML = "";

    var safeStr = window.escapeHtml || function (s) { return s; };

    users.forEach(function (user) {
        var row = document.createElement("tr");
        var emailSafe = safeStr(user.emaildangki);
        var nameSafe = safeStr(user.tendangnhap || "N/A");
        var phoneSafe = safeStr(user.sodienthoai || "N/A");
        var addressSafe = safeStr(user.diachi || "N/A");
        var isAdmin = (user.phanquyen || "").toLowerCase() === "admin";

        row.innerHTML =
            '<td data-label="Ảnh Đại Diện">' + (user.hinhAnh ? '<img src="' + safeStr(user.hinhAnh) + '" width="40" height="40" style="border-radius: 50%;">' : "N/A") + "</td>" +
            '<td data-label="Email">' + emailSafe + "</td>" +
            '<td data-label="Tên Đăng Nhập">' + nameSafe + "</td>" +
            '<td data-label="Quyền">' +
            '  <select onchange="updateUserRole(\'' + emailSafe + "', this.value)\">" +
            '    <option value="Admin"' + (isAdmin ? " selected" : "") + ">Admin</option>" +
            '    <option value="User"' + (!isAdmin ? " selected" : "") + ">User</option>" +
            "  </select>" +
            "</td>" +
            '<td data-label="Số điện thoại">' + phoneSafe + "</td>" +
            '<td data-label="Địa chỉ">' + addressSafe + "</td>" +
            '<td data-label="Giới Tính">' + safeStr(formatGender(user.gioitinh)) + "</td>" +
            '<td data-label="Ngày Tạo">' + window.formatDateVN(user.ngayTao) + "</td>" +
            '<td data-label="Hành Động">' +
            '  <button class="btn btn-warning btn-sm" style="margin-right: 5px;" onclick="openEditModal(\'' + emailSafe + "')\">" + "Sửa</button>" +
            '  <button class="btn btn-danger btn-sm" onclick="deleteUser(\'' + emailSafe + "')\">Xóa</button>" +
            "</td>";
        userList.appendChild(row);
    });
}

// ── Định dạng giới tính ──
function formatGender(gender) {
    if (!gender) return "N/A";
    var g = gender.toLowerCase().trim();
    var map = { "nam": "Nam", "male": "Nam", "1": "Nam", "nữ": "Nữ", "nu": "Nữ", "female": "Nữ", "0": "Nữ", "khác": "Khác", "other": "Khác", "2": "Khác" };
    return map[g] || gender;
}

// ── Cập nhật quyền người dùng ──
async function updateUserRole(email, role) {
    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan/" + encodeURIComponent(email), {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "phanquyen=" + encodeURIComponent(role)
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

// ── Modal chỉnh sửa người dùng ──
function openEditModal(email) {
    var user = globalUsersList.find(function (u) { return u.emaildangki === email; });
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

    var email = document.getElementById("editEmail").value;
    var formData = new URLSearchParams();
    formData.append("tendangnhap", document.getElementById("editTendangnhap").value);

    var pass = document.getElementById("editMatkhau").value;
    if (pass) formData.append("matkhau", pass);

    formData.append("sodienthoai", document.getElementById("editSodienthoai").value);
    formData.append("diachi", document.getElementById("editDiachi").value);
    formData.append("gioitinh", document.getElementById("editGioitinh").value);
    formData.append("phanquyen", document.getElementById("editPhanquyen").value);

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan/admin-update/" + encodeURIComponent(email), {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        if (response.ok) {
            alert("Cập nhật thông tin người dùng thành công!");
            closeEditModal();
            fetchUsers();
        } else {
            var err = await response.json().catch(function () { return {}; });
            throw new Error(err.Message || "Cập nhật thất bại!");
        }
    } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error);
        alert(error.message || "Lỗi khi cập nhật người dùng");
    }
}

// ── Xóa người dùng ──
async function deleteUser(email) {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan/" + encodeURIComponent(email), {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Xóa người dùng thành công!");
            fetchUsers();
        } else {
            throw new Error("Xóa người dùng thất bại!");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.message || "Error deleting user");
    }
}
