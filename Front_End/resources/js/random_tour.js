document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("tourCarousel");
    const placeholder = document.querySelector(".carousel-placeholder");

    fetch("https://localhost:7265/api/Tour/random-tours")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dữ liệu nhận từ API:", data);

            if (!Array.isArray(data) || data.length === 0) {
                carousel.innerHTML = "<p>Không có tour nào để hiển thị.</p>";
                return;
            }

            carousel.innerHTML = ""; // Xóa nội dung cũ

            data.forEach(tour => {
                const tourElement = document.createElement("div");
                tourElement.classList.add("carousel-cell");

                // Kiểm tra tên tour
                const tourName = tour.tentour || "Tên tour không xác định";  // sửa từ Tentour thành tentour

                // Xử lý ảnh
                let hinhAnh = tour.hinhAnh && tour.hinhAnh.trim() !== "" ? tour.hinhAnh : "/images/default.jpg";

                if (!hinhAnh.startsWith("http")) {
                    hinhAnh = `https://localhost:7265/${hinhAnh.replace(/^\/+/, '')}`;
                }

                // Tạo nội dung cho tour
                tourElement.innerHTML = `
                    <img src="${hinhAnh}" class="carousel-image" alt="${tourName}" 
                         onerror="this.src='https://localhost:7265/images/tours/images.jpg'">
                    <div class="carousel-caption">${tourName}</div>
                `;

                carousel.appendChild(tourElement);
            });

            // Khởi tạo Flickity sau khi thêm phần tử
            new Flickity(carousel, {
                wrapAround: true,
                autoPlay: 3000,
                cellAlign: 'left', // Đảm bảo các phần tử căn trái
                contain: true,
                setGallerySize: false, // Tắt kích thước gallery tự động
            });

            if (placeholder) placeholder.remove();
        })
        .catch(error => {
            console.error("Lỗi tải dữ liệu tour:", error);
            carousel.innerHTML = "<p>Lỗi tải dữ liệu. Vui lòng thử lại sau.</p>";
            if (placeholder) placeholder.remove();
        });
});
