let profileUserEmail = "";
let selectedAvatarFile = null;

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

document.addEventListener("DOMContentLoaded", async function () {
    const userStored = JSON.parse(localStorage.getItem("user"));
    if (!userStored) {
        window.location.href = "index.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || userStored.email;
    profileUserEmail = email;

    if (!email) {
        alert("Không tìm thấy thông tin tài khoản!");
        window.location.href = "index.html";
        return;
    }

    try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            alert("Không tìm thấy mã xác thực (JWT Token). Vui lòng ĐĂNG XUẤT và ĐĂNG NHẬP lại!");
            return;
        }

        if (typeof window.showLoading === "function") window.showLoading("Đang tải thông tin hồ sơ...");
        const fetchFunc = getAuthFetch();
        const response = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/info/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error("Phiên làm việc đã hết hạn hoặc bạn không có quyền xem hồ sơ này. Vui lòng đăng nhập lại!");
            }
            const error = await response.json().catch(() => ({}));
            throw new Error(error.Message || error.message || "Không thể tải thông tin người dùng!");
        }

        const user = await response.json();

        // Hiển thị thông tin
        document.getElementById("email").textContent = user.emaildangki || "";
        document.getElementById("tendangnhap").value = user.tendangnhap || "";
        document.getElementById("sodienthoai").value = user.sodienthoai || "";
        document.getElementById("diachi").value = user.diachi || "";
        
        // Chọn giới tính tương ứng với dữ liệu
        if (user.gioitinh === "Nam") {
            document.getElementById("gioitinhNam").checked = true;
        } else if (user.gioitinh === "Nữ") {
            document.getElementById("gioitinhNu").checked = true;
        } else {
            document.getElementById("gioitinhKhac").checked = true;
        }

        document.getElementById("phanquyen").textContent = user.phanquyen || "";
        document.getElementById("ngaytao").textContent = user.ngayTao ? new Date(user.ngayTao).toLocaleString("vi-VN") : "";

        // Ảnh đại diện
        const avatarImg = document.getElementById("avatar");
        const headerAvatar = document.querySelector(".account-icon img");
        const baseUrl = "https://webdulichlo.onrender.com";  // URL backend API

        if (user.tendangnhap) {
            userStored.tendangnhap = user.tendangnhap;
            const headerUserName = document.getElementById("user-name");
            if (headerUserName) headerUserName.textContent = user.tendangnhap;
            localStorage.setItem("user", JSON.stringify(userStored));
        }

        if (user.hinhAnh && user.hinhAnh.trim() !== "") {
            const avatarSrc = user.hinhAnh.startsWith("http")
                ? user.hinhAnh
                : `${baseUrl}${user.hinhAnh.startsWith("/") ? "" : "/"}${user.hinhAnh}`;
            avatarImg.src = avatarSrc;
            if (headerAvatar) headerAvatar.src = avatarSrc;

            if (user.hinhAnh.startsWith("http")) {
                userStored.hinhAnh = user.hinhAnh;
                localStorage.setItem("user", JSON.stringify(userStored));
            }
        } else {
            avatarImg.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        }

    } catch (err) {
        console.error("Lỗi khi tải hồ sơ:", err);
        alert(err.message || "Đã xảy ra lỗi khi tải hồ sơ.");
    } finally {
        if (typeof window.hideLoading === "function") window.hideLoading();
    }
});

function editField(fieldId) {
    const input = document.getElementById(fieldId);
    input.removeAttribute("readonly");
    input.nextElementSibling.nextElementSibling.hidden = false;
}

async function saveField(fieldId) {
    const input = document.getElementById(fieldId);
    const value = input.value.trim();
    if (!value) return alert("Không được để trống!");

    const formData = new FormData();
    formData.append(fieldId, value);

    await updateUser(formData);
    input.setAttribute("readonly", true);
    input.nextElementSibling.nextElementSibling.hidden = true;
}

function editGender() {
    const genderRadios = document.querySelectorAll('input[name="gioitinh"]');
    
    genderRadios.forEach(radio => {
        radio.disabled = false;
    });

    document.getElementById("save-gender-btn").hidden = false;
}

async function saveGender() {
    const genderRadios = document.querySelectorAll('input[name="gioitinh"]:checked');
    const gioitinh = genderRadios.length > 0 ? genderRadios[0].value : null;

    if (!gioitinh) {
        alert("Vui lòng chọn giới tính!");
        return;
    }

    const formData = new FormData();
    formData.append("gioitinh", gioitinh);

    try {
        await updateUser(formData);
        genderRadios.forEach(radio => radio.disabled = true);
        document.getElementById("save-gender-btn").hidden = true;
    } catch (err) {
        console.error("Lỗi khi cập nhật giới tính:", err);
        alert("Cập nhật giới tính không thành công!");
    }
}

// Đổi avatar
document.getElementById("avatarInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("avatar").src = e.target.result;
    };
    reader.readAsDataURL(file);

    document.getElementById("save-avatar").hidden = false;
});

async function saveAvatar() {
    if (!selectedAvatarFile) return;

    const saveBtn = document.getElementById("save-avatar");
    if (typeof window.setButtonLoading === "function") window.setButtonLoading(saveBtn, true, "Đang lưu ảnh...");

    const formData = new FormData();
    formData.append("hinhAnh", selectedAvatarFile);

    try {
        const result = await updateUser(formData, "Đang tải ảnh đại diện lên Cloudinary...");
        document.getElementById("save-avatar").hidden = true;
        selectedAvatarFile = null;

        // Cập nhật lại Avatar từ Cloudinary URL trả về
        const newHinhAnh = result?.hinhAnh || result?.HinhAnh;
        const headerAvatar = document.querySelector(".account-icon img");
        const profileAvatar = document.getElementById("avatar");
        if (newHinhAnh) {
            if (profileAvatar) profileAvatar.src = newHinhAnh;
            if (headerAvatar) headerAvatar.src = newHinhAnh;
            const userStored = JSON.parse(localStorage.getItem("user")) || {};
            userStored.hinhAnh = newHinhAnh;
            localStorage.setItem("user", JSON.stringify(userStored));
        }
    } finally {
        if (typeof window.setButtonLoading === "function") window.setButtonLoading(saveBtn, false);
    }
}

// Hàm gọi API cập nhật
async function updateUser(formData, customLoadingMsg = "Đang cập nhật thông tin...") {
    if (typeof window.showLoading === "function") window.showLoading(customLoadingMsg);
    try {
        const fetchFunc = getAuthFetch();
        const res = await fetchFunc(`https://webdulichlo.onrender.com/api/TaiKhoan/update/${encodeURIComponent(profileUserEmail)}`, {
            method: "PUT",
            body: formData
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.Message || error.message || `Cập nhật thất bại (${res.status})!`);
        }

        const data = await res.json();
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

// Tải avatar
function downloadAvatar() {
    const avatarImg = document.getElementById("avatar");
    const fileName = avatarImg.src.split('/').pop();  // Lấy tên tệp từ URL
    window.location.href = `https://webdulichlo.onrender.com/api/TaiKhoan/download/${fileName}`;
}
