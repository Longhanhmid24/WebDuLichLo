/* =============================================================
   ADD_PROFILE.JS — Trang Hồ Sơ Cá Nhân
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

var profileUserEmail = "";
var selectedAvatarFile = null;

// ── Khởi tạo trang Hồ Sơ ──
document.addEventListener("DOMContentLoaded", async function () {
    var userStored = JSON.parse(localStorage.getItem("user"));
    if (!userStored) {
        window.location.href = "index.html";
        return;
    }

    var params = new URLSearchParams(window.location.search);
    profileUserEmail = params.get("email") || userStored.email;

    if (!profileUserEmail) {
        alert("Không tìm thấy thông tin tài khoản!");
        window.location.href = "index.html";
        return;
    }

    var token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Không tìm thấy mã xác thực (JWT Token). Vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP lại!");
        return;
    }

    try {
        if (typeof window.showLoading === "function") window.showLoading("Đang tải thông tin hồ sơ...");

        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan/info/" + encodeURIComponent(profileUserEmail));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
            }
            var errBody = await response.json().catch(function () { return {}; });
            throw new Error(errBody.Message || errBody.message || "Không thể tải thông tin người dùng!");
        }

        var user = await response.json();
        renderUserProfile(user);
        fetchUserOrderStats(profileUserEmail);

    } catch (err) {
        console.error("Lỗi khi tải hồ sơ:", err);
        alert(err.message || "Đã xảy ra lỗi khi tải hồ sơ.");
    } finally {
        if (typeof window.hideLoading === "function") window.hideLoading();
    }
});

// ── Hiển thị thông tin người dùng lên UI ──
function renderUserProfile(user) {
    document.getElementById("email").textContent = user.emaildangki || "";
    document.getElementById("profile-display-name").textContent = user.tendangnhap || user.emaildangki;
    document.getElementById("tendangnhap").value = user.tendangnhap || "";
    document.getElementById("sodienthoai").value = user.sodienthoai || "";
    document.getElementById("diachi").value = user.diachi || "";

    var genderMap = { "Nam": "gioitinhNam", "Nữ": "gioitinhNu" };
    var genderId = genderMap[user.gioitinh] || "gioitinhKhac";
    var genderElem = document.getElementById(genderId);
    if (genderElem) genderElem.checked = true;

    document.getElementById("phanquyen").textContent = "👑 Quyền: " + (user.phanquyen || "User");
    document.getElementById("ngaytao").textContent = window.formatDateVN(user.ngayTao);

    var avatarImg = document.getElementById("avatar");
    var headerAvatar = document.querySelector(".account-icon img");
    var avatarSrc = window.resolveImageUrl(user.hinhAnh, window.DEFAULT_AVATAR);
    avatarImg.src = avatarSrc;
    if (headerAvatar) headerAvatar.src = avatarSrc;
}

// ── Thống kê tài khoản (số đơn, số yêu thích) ──
async function fetchUserOrderStats(email) {
    var fetchFunc = window.getAuthFetch();

    try {
        var res = await fetchFunc(window.API_BASE_URL + "/api/Dondattour/get-orders?email=" + encodeURIComponent(email));
        if (res.ok) {
            var orders = await res.json();
            document.getElementById("stat-orders-count").textContent = (orders ? orders.length : 0) + " đơn";
        } else {
            document.getElementById("stat-orders-count").textContent = "0 đơn";
        }
    } catch (e) {
        document.getElementById("stat-orders-count").textContent = "0 đơn";
    }

    try {
        var resFav = await fetchFunc(window.API_BASE_URL + "/api/YeuThich");
        if (resFav.ok) {
            var favs = await resFav.json();
            document.getElementById("stat-wishlist-count").textContent = (favs ? favs.length : 0) + " tour";
        } else {
            document.getElementById("stat-wishlist-count").textContent = "0 tour";
        }
    } catch (e) {
        document.getElementById("stat-wishlist-count").textContent = "0 tour";
    }
}

// ── Chỉnh sửa / Lưu trường thông tin ──
function editField(fieldId) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    input.removeAttribute("readonly");
    input.focus();

    var wrapper = input.closest(".input-with-action");
    if (wrapper) {
        var editBtn = wrapper.querySelector(".btn-icon-edit");
        var saveBtn = wrapper.querySelector(".btn-save-inline");
        if (editBtn) editBtn.hidden = true;
        if (saveBtn) saveBtn.hidden = false;
    }
}

async function saveField(fieldId) {
    var input = document.getElementById(fieldId);
    if (!input) return;

    var value = input.value.trim();
    if (!value) return alert("Vui lòng nhập giá trị, không được để trống!");

    ensureProfileEmail();
    if (!profileUserEmail) return;

    var formData = new FormData();
    formData.append(fieldId, value);

    try {
        await updateUser(formData);
        input.setAttribute("readonly", true);

        var wrapper = input.closest(".input-with-action");
        if (wrapper) {
            var editBtn = wrapper.querySelector(".btn-icon-edit");
            var saveBtn = wrapper.querySelector(".btn-save-inline");
            if (editBtn) editBtn.hidden = false;
            if (saveBtn) saveBtn.hidden = true;
        }
    } catch (err) {
        console.error("Lỗi khi lưu thông tin:", err);
    }
}

// ── Chỉnh sửa / Lưu giới tính ──
function editGender() {
    document.querySelectorAll('input[name="gioitinh"]').forEach(function (radio) {
        radio.disabled = false;
    });
    var editBtn = document.getElementById("edit-gender-btn");
    var saveBtn = document.getElementById("save-gender-btn");
    if (editBtn) editBtn.hidden = true;
    if (saveBtn) saveBtn.hidden = false;
}

async function saveGender() {
    var checked = document.querySelector('input[name="gioitinh"]:checked');
    if (!checked) {
        alert("Vui lòng chọn giới tính!");
        return;
    }

    ensureProfileEmail();
    if (!profileUserEmail) return;

    var formData = new FormData();
    formData.append("gioitinh", checked.value);

    try {
        await updateUser(formData);
        document.querySelectorAll('input[name="gioitinh"]').forEach(function (r) { r.disabled = true; });
        var editBtn = document.getElementById("edit-gender-btn");
        var saveBtn = document.getElementById("save-gender-btn");
        if (editBtn) editBtn.hidden = false;
        if (saveBtn) saveBtn.hidden = true;
    } catch (err) {
        console.error("Lỗi khi cập nhật giới tính:", err);
    }
}

// ── Đổi Avatar ──
document.getElementById("avatarInput").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;

    selectedAvatarFile = file;

    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("avatar").src = e.target.result;
    };
    reader.readAsDataURL(file);

    document.getElementById("save-avatar").hidden = false;
});

async function saveAvatar() {
    if (!selectedAvatarFile) return;

    var saveBtn = document.getElementById("save-avatar");
    if (typeof window.setButtonLoading === "function") window.setButtonLoading(saveBtn, true, "Đang lưu ảnh...");

    var formData = new FormData();
    formData.append("hinhAnh", selectedAvatarFile);

    try {
        var result = await updateUser(formData, "Đang tải ảnh đại diện lên Cloudinary...");
        document.getElementById("save-avatar").hidden = true;
        selectedAvatarFile = null;

        var newHinhAnh = result ? (result.hinhAnh || result.HinhAnh) : null;
        if (newHinhAnh) {
            var profileAvatar = document.getElementById("avatar");
            var headerAvatar = document.querySelector(".account-icon img");
            if (profileAvatar) profileAvatar.src = newHinhAnh;
            if (headerAvatar) headerAvatar.src = newHinhAnh;
            var userStored = JSON.parse(localStorage.getItem("user")) || {};
            userStored.hinhAnh = newHinhAnh;
            localStorage.setItem("user", JSON.stringify(userStored));
        }
    } finally {
        if (typeof window.setButtonLoading === "function") window.setButtonLoading(saveBtn, false);
    }
}

// ── Hàm gọi API cập nhật (dùng chung) ──
async function updateUser(formData, customLoadingMsg) {
    customLoadingMsg = customLoadingMsg || "Đang cập nhật thông tin...";
    if (typeof window.showLoading === "function") window.showLoading(customLoadingMsg);

    try {
        var fetchFunc = window.getAuthFetch();
        var res = await fetchFunc(window.API_BASE_URL + "/api/TaiKhoan/update/" + encodeURIComponent(profileUserEmail), {
            method: "PUT",
            body: formData
        });

        if (!res.ok) {
            var error = await res.json().catch(function () { return {}; });
            throw new Error(error.Message || error.message || "Cập nhật thất bại (" + res.status + ")!");
        }

        var data = await res.json();
        alert("Cập nhật thành công!");
        return data;
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        alert(err.message || "Có lỗi xảy ra.");
        throw err;
    } finally {
        if (typeof window.hideLoading === "function") window.hideLoading();
    }
}

// ── Helper: Đảm bảo profileUserEmail luôn có giá trị ──
function ensureProfileEmail() {
    if (!profileUserEmail) {
        var userStored = JSON.parse(localStorage.getItem("user"));
        profileUserEmail = userStored ? userStored.email : null;
    }
    if (!profileUserEmail) {
        alert("Không tìm thấy thông tin email. Vui lòng đăng nhập lại!");
    }
}
