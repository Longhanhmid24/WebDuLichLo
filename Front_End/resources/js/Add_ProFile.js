async function loadProfile() {
    const email = document.getElementById('emailInput').value; // Lấy email người dùng.
    try {
        const response = await fetch(`/api/TaiKhoan/info/${email}`); // Gọi API.
        if (response.ok) {
            const userData = await response.json();
            document.getElementById('nameInput').value = userData.tendangnhap;
            document.getElementById('addressInput').value = userData.diachi;
            document.getElementById('phoneInput').value = userData.sodienthoai;
            // Hiển thị giới tính
            const genderRadio = document.querySelector(`input[name="gender"][value="${userData.gioitinh}"]`);
            if (genderRadio) {
                genderRadio.checked = true;
            }
            // Hiển thị avatar
            document.getElementById('avatarPreview').src = userData.hinhAnh;
            document.getElementById('avatarPreview').style.display = "block";
            document.getElementById('uploadText').style.display = "none";
        } else {
            const errorData = await response.json();
            alert(`Lỗi tải thông tin: ${errorData.message || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error('Lỗi mạng:', error);
        alert('Lỗi mạng. Vui lòng thử lại sau.');
    }
}

function toggleEditMode(isEdit) {
    const inputs = document.querySelectorAll('.info-input');
    const genderOptions = document.querySelectorAll('input[name="gender"]');
    inputs.forEach(input => input.disabled = !isEdit);
    genderOptions.forEach(option => option.disabled = !isEdit);
    document.getElementById('saveBtn').disabled = !isEdit;
    document.getElementById('editBtn').disabled = isEdit;
}

async function saveProfile() {
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const address = document.getElementById('addressInput').value;
    const phone = document.getElementById('phoneInput').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const imageFile = document.getElementById('avatarInput').files[0];

    if (!name || !email || !address || !phone || !gender) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const formData = new FormData();
    formData.append('tendangnhap', name);
    formData.append('email', email);
    formData.append('diachi', address);
    formData.append('sodienthoai', phone);
    formData.append('gioitinh', gender);
    if (imageFile) {
        formData.append('imageFile', imageFile);
    }

    try {
        const response = await fetch(`/api/TaiKhoan/update/${email}`, { // Thay đổi đường dẫn API nếu cần
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Thông tin đã được cập nhật thành công!');
            toggleEditMode(false);
        } else {
            const errorData = await response.json();
            alert(`Lỗi cập nhật: ${errorData.message || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error('Lỗi mạng:', error);
        alert('Lỗi mạng. Vui lòng thử lại sau.');
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function previewAvatar(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("avatarPreview");
    const uploadText = document.getElementById("uploadText");

    if (file) {
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp ảnh hợp lệ!");
            event.target.value = "";
            preview.src = "";
            preview.style.display = "none";
            if (uploadText) uploadText.style.display = "block";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            if (uploadText) uploadText.style.display = "none";
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = "none";
        if (uploadText) uploadText.style.display = "block";
    }
}

// Gọi loadProfile khi trang web được tải.
window.onload = loadProfile;