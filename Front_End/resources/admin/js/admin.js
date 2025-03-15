document.addEventListener("DOMContentLoaded", function () {
    let imageInput = document.getElementById("image");
    let preview = document.getElementById("previewImage");

    // Xem trước ảnh khi chọn file
    imageInput.addEventListener("change", function(event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = "block"; // Hiển thị ảnh
            };
            reader.readAsDataURL(file);
        }
    });

    // Xử lý khi gửi form
    document.querySelector("form").addEventListener("submit", async function(event) {
        event.preventDefault(); // Ngăn chặn load lại trang
        let formData = new FormData();
        formData.append("tentour", document.getElementById("name").value);
        formData.append("gia", document.getElementById("price").value);
        formData.append("mota", document.getElementById("itinerary").value);
        formData.append("sokhach", document.getElementById("availability").value);
        formData.append("hinhanh", document.getElementById("image").files[0]); // Gửi file ảnh

        try {
            let response = await fetch("https://localhost:7265/api/tour/add", { 
                method: "POST",
                body: formData 
            });

            if (response.ok) {
                alert("✅ Thêm tour thành công!");
                document.querySelector("form").reset(); // Reset form sau khi gửi thành công
                preview.style.display = "none"; // Ẩn ảnh sau khi gửi
            } else {
                let errorText = await response.text();
                alert("❌ Lỗi khi thêm tour: " + errorText);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            alert("⚠ Không thể kết nối đến server!");
        }
    });
});
