let userEmail = "";
let selectedAvatarFile = null;

document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    userEmail = email;

    if (!email) {
        alert("Không tìm thấy email trong URL!");
        return;
    }

    try {
        const response = await fetch(`https://localhost:7265/api/TaiKhoan/info/${encodeURIComponent(email)}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.Message || "Không thể tải thông tin người dùng!");
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
        const baseUrl = "https://localhost:7265";  // URL backend API

        avatarImg.src = user.hinhAnh && user.hinhAnh !== ""
            ? `${baseUrl}${user.hinhAnh}`  // Thêm baseUrl vào đường dẫn
            : `${baseUrl}/images/anhmacdinh.jpg`;   // Giả sử ảnh mặc định cũng nằm trong wwwroot


            } catch (err) {
                console.error("Lỗi khi tải hồ sơ:", err);
                alert(err.message || "Đã xảy ra lỗi khi tải hồ sơ.");
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

    const formData = new FormData();
    formData.append("hinhAnh", selectedAvatarFile);

    await updateUser(formData);
    document.getElementById("save-avatar").hidden = true;
    selectedAvatarFile = null;
}

// Hàm gọi API cập nhật
async function updateUser(formData) {
    try {
        const res = await fetch(`https://localhost:7265/api/TaiKhoan/update/${encodeURIComponent(userEmail)}`, {
            method: "PUT",
            body: formData
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.Message || "Cập nhật thất bại!");
        }

        alert("Cập nhật thành công!");
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        alert(err.message || "Có lỗi xảy ra.");
    }
}

// Tải avatar
function downloadAvatar() {
    const avatarImg = document.getElementById("avatar");
    const fileName = avatarImg.src.split('/').pop();  // Lấy tên tệp từ URL
    window.location.href = `https://localhost:7265/api/TaiKhoan/download/${fileName}`;
}
