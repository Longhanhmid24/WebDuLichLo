// document.addEventListener("DOMContentLoaded", function () {
//     const carousel = document.getElementById("tourCarousel");
//     const placeholder = document.querySelector(".carousel-placeholder");

//     fetch("https://localhost:7265/api/Tour/random-tours")
//         .then(response => response.json())
//         .then(data => {
//             console.log("Dữ liệu nhận từ API:", data);
            
//             if (!Array.isArray(data) || data.length === 0) {
//                 carousel.innerHTML = "<p>Không có tour nào để hiển thị.</p>";
//                 return;
//             }

//             carousel.innerHTML = ""; // Xóa nội dung cũ

//             data.forEach(tour => {
//                 const tourElement = document.createElement("div");
//                 tourElement.classList.add("carousel-cell");

//                 let imageUrl = tour.HinhAnh ? `https://localhost:7265${tour.HinhAnh}` : "images/anh-gai-xinh-14.jpg";

//                 tourElement.innerHTML = `
//                     <img src="${imageUrl}" alt="${tour.Tentour}" class="carousel-image" 
//                         onerror="this.src='images/tours/images.jpg'">
//                     <div class="carousel-caption">${tour.Tentour}</div>
//                 `;

//                 carousel.appendChild(tourElement);
//             });

//             // Khởi tạo Flickity sau khi thêm phần tử
//             new Flickity(carousel, {
//                 wrapAround: true,
//                 autoPlay: 3000,
//                 cellAlign: "center",
//                 contain: true
//             });

//             if (placeholder) placeholder.remove();
//         })
//         .catch(error => {
//             console.error("Lỗi tải dữ liệu tour:", error);
//             carousel.innerHTML = "<p>Lỗi tải dữ liệu. Vui lòng thử lại sau.</p>";
//             if (placeholder) placeholder.remove();
//         });
// });
