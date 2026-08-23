/* =============================================================
   RANDOM_TOUR.JS — Carousel tour ngẫu nhiên (Trang chủ)
   Yêu cầu: config.js đã nạp trước.
   ============================================================= */

document.addEventListener("DOMContentLoaded", function () {
    var carousel = document.getElementById("tourCarousel");
    var placeholder = document.querySelector(".carousel-placeholder");

    fetch(window.API_BASE_URL + "/api/Tour/random-tours")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (!Array.isArray(data) || data.length === 0) {
                carousel.innerHTML = "<p>Không có tour nào để hiển thị.</p>";
                return;
            }

            var limitedData = data.slice(0, 11);
            carousel.innerHTML = "";

            limitedData.forEach(function (tour) {
                var tourElement = document.createElement("div");
                tourElement.classList.add("carousel-cell");

                var tourName = tour.tentour || "Tên tour không xác định";
                var hinhAnh = window.resolveImageUrl(tour.hinhAnh);

                tourElement.innerHTML =
                    '<img src="' + hinhAnh + '" class="carousel-image" alt="' + tourName + '"' +
                    '     onerror="this.src=\'' + window.API_BASE_URL + '/images/tours/images.jpg\'">' +
                    '<div class="carousel-caption">' + tourName + "</div>";

                carousel.appendChild(tourElement);
            });

            // Khởi tạo Flickity
            new Flickity(carousel, {
                wrapAround: true,
                autoPlay: 3500,
                pauseAutoPlayOnHover: true,
                cellAlign: "center",
                pageDots: true,
                prevNextButtons: true,
                draggable: true,
                friction: 0.28,
                selectedAttraction: 0.025
            });

            if (placeholder) placeholder.remove();
        })
        .catch(function (error) {
            console.error("Lỗi tải dữ liệu tour:", error);
            carousel.innerHTML = "<p>Lỗi tải dữ liệu. Vui lòng thử lại sau.</p>";
            if (placeholder) placeholder.remove();
        });
});
