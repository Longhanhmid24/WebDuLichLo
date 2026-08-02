// UI and Logic for Add and Edit Tour Page

document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra chế độ Thêm hay Sửa bằng cách đọc query parameter "id"
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get("id");
    const isEditMode = !!tourId;

    const pageTitle = document.querySelector("h2");
    const submitBtn = document.querySelector("button[type='submit']");
    const form = document.getElementById("addTourForm");

    // Nếu ở chế độ chỉnh sửa, tải dữ liệu cũ lên form
    if (isEditMode) {
        pageTitle.textContent = "Chỉnh Sửa Tour Du Lịch";
        submitBtn.textContent = "Cập Nhật Tour";

        // Tải chi tiết tour từ API
        fetch(`https://webdulichlo.onrender.com/api/Tour/${tourId}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error("Không thể tải thông tin tour");
                }
                return response.json();
            })
            .then(tour => {
                document.getElementById("Tentour").value = tour.tentour;
                // Định dạng giá trị hiển thị cho Gia
                document.getElementById("Gia").value = Number(tour.gia).toLocaleString("vi-VN");
                document.getElementById("Mota").value = tour.mota || "";
                document.getElementById("Sokhach").value = tour.sokhach;
                
                // Định dạng Date YYYY-MM-DD để hiển thị lên thẻ input date
                if (tour.ngayKhoiHanh) {
                    document.getElementById("NgayKhoiHanh").value = tour.ngayKhoiHanh.split("T")[0];
                }
                if (tour.ngayKetThuc) {
                    document.getElementById("NgayKetThuc").value = tour.ngayKetThuc.split("T")[0];
                }

                // Chọn loại tour tương ứng
                if (tour.loaiTour) {
                    const cleanLoaiTour = tour.loaiTour.trim();
                    if (cleanLoaiTour.toLowerCase().includes("trong nước") || cleanLoaiTour.toLowerCase() === "trong nước") {
                        document.getElementById("trongnuoc").checked = true;
                    } else {
                        document.getElementById("ngoainuoc").checked = true;
                    }
                }

                // Hiển thị ảnh cũ
                if (tour.hinhAnh) {
                    const preview = document.getElementById("preview");
                    const uploadText = document.getElementById("upload-text");
                    const baseUrl = "https://webdulichlo.onrender.com";
                    preview.src = tour.hinhAnh.startsWith("http") ? tour.hinhAnh : `${baseUrl}${tour.hinhAnh}`;
                    preview.style.display = "block";
                    uploadText.style.display = "none";
                }
            })
            .catch(error => {
                console.error("Lỗi khi tải thông tin tour:", error);
                alert("Lỗi: " + error.message);
            });
    }

    // Gắn sự kiện submit form
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // 1. Trạng thái Loading và khóa nút bấm
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Đang xử lý...";

        const formData = new FormData();
        formData.append("Tentour", document.getElementById("Tentour").value);
        // Loại bỏ dấu chấm phân tách hàng nghìn trước khi gửi lên API
        const giaCleaned = document.getElementById("Gia").value.replace(/\./g, "");
        formData.append("Gia", giaCleaned);
        formData.append("Mota", document.getElementById("Mota").value);
        formData.append("Sokhach", document.getElementById("Sokhach").value);
        formData.append("NgayKhoiHanh", document.getElementById("NgayKhoiHanh").value);
        formData.append("NgayKetThuc", document.getElementById("NgayKetThuc").value);

        // Lấy giá trị LoaiTour từ input radio
        const loaiTourValue = document.querySelector('input[name="LoaiTour"]:checked');
        if (loaiTourValue) {
            formData.append("LoaiTour", loaiTourValue.value);
        }

        const imageFile = document.getElementById("HinhAnh").files[0];
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }

        // Quyết định URL và Method của API tùy theo chế độ Thêm hay Sửa
        const apiUrl = isEditMode 
            ? `https://webdulichlo.onrender.com/api/Tour/update/${tourId}`
            : "https://webdulichlo.onrender.com/api/Tour/add";
        const apiMethod = isEditMode ? "PUT" : "POST";

        if (typeof window.showLoading === "function") window.showLoading(isEditMode ? "Đang cập nhật thông tin tour..." : "Đang tải ảnh lên Cloudinary & tạo tour...");
        if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, true, isEditMode ? "Đang cập nhật..." : "Đang thêm tour...");

        fetch(apiUrl, {
            method: apiMethod,
            body: formData
        })
            .then(async response => {
                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errData = await response.json();
                        throw new Error(errData.message || "Đã xảy ra lỗi");
                    } else {
                        const errText = await response.text();
                        throw new Error(errText || "Đã xảy ra lỗi");
                    }
                }
                return response.json();
            })
            .then(data => {
                alert(isEditMode ? "Cập nhật tour thành công!" : "Tour đã được thêm thành công!");
                console.log("Dữ liệu trả về:", data);
                
                if (isEditMode) {
                    // Nếu sửa thành công, điều hướng về trang chủ
                    window.location.href = "../../index.html";
                } else {
                    form.reset();
                    document.getElementById("preview").src = "";
                    document.getElementById("preview").style.display = "none";
                    document.getElementById("upload-text").style.display = "block";
                }
            })
            .catch(error => {
                console.error("Lỗi khi gửi yêu cầu:", error);
                alert(error.message);
            })
            .finally(() => {
                if (typeof window.hideLoading === "function") window.hideLoading();
                if (typeof window.setButtonLoading === "function") window.setButtonLoading(submitBtn, false);
                // Khôi phục nút bấm sau khi xử lý xong
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
    });

    // Tự động định dạng số tiền VND (ví dụ: 100.000.000) khi người dùng gõ
    document.getElementById("Gia").addEventListener("input", function (e) {
        let value = this.value.replace(/\D/g, ""); // Xóa toàn bộ ký tự không phải là số
        if (value) {
            this.value = Number(value).toLocaleString("vi-VN");
        } else {
            this.value = "";
        }
    });
});

// Hàm hiển thị ảnh xem trước (Được gọi từ onchange của input file)
function previewImage(event) {
    const preview = document.getElementById("preview");
    const uploadText = document.getElementById("upload-text");

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            uploadText.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
}
