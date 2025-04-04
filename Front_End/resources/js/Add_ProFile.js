function toggleEditMode(isEdit) {
    const inputs = document.querySelectorAll('.info-input');
    const genderOptions = document.querySelectorAll('input[name="gender"]');
    inputs.forEach(input => input.disabled = !isEdit);
    genderOptions.forEach(option => option.disabled = !isEdit);
    document.getElementById('saveBtn').disabled = !isEdit;
    document.getElementById('editBtn').disabled = isEdit;
}

function saveProfile() {
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const address = document.getElementById('addressInput').value;
    const phone = document.getElementById('phoneInput').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    if (!name || !email || !address || !phone || !gender) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    alert(`Thông tin đã được lưu:\nTên: ${name}\nEmail: ${email}\nĐịa chỉ: ${address}\nSĐT: ${phone}\nGiới tính: ${gender}`);
    toggleEditMode(false);
}

function goBack() {
    window.location.href = 'index.html';
}

function previewAvatar(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("avatarPreview");
    const uploadText = document.getElementById("uploadText");

    if (file) {
        // Kiểm tra loại file
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