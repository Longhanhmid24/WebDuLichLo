// document.addEventListener("DOMContentLoaded", function () {
//     // Kết nối WebSocket
//     const socket = new WebSocket("ws://localhost:5042/ws");

//     socket.onopen = function () {
//         console.log("✅ WebSocket connected!");
//     };

//     socket.onmessage = function (msg) {
//         console.log("📩 Message from server:", msg.data);
//         if (msg.data === "reload") {
//             window.location.reload();
//         } else if (msg.data === "refreshcss") {
//             refreshCSS();
//         }
//     };

//     socket.onerror = function (error) {
//         console.error("❌ WebSocket error:", error);
//     };

//     socket.onclose = function (event) {
//         console.warn("⚠️ WebSocket closed:", event);
//     };

//     // Hàm toggle Sidebar
//     function toggleSidebar() {
//         document.getElementById("sidebar").classList.toggle("show");
//     }

//     // Hàm toggle Fullscreen
//     function toggleFullscreen() {
//         if (!document.fullscreenElement) {
//             document.documentElement.requestFullscreen().catch(err => {
//                 alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
//             });
//         } else {
//             document.exitFullscreen();
//         }
//     }

//     // Hàm toggle Dark Mode
//     function toggleDarkMode() {
//         document.body.classList.toggle("dark-mode");
//     }

//     // Lắng nghe sự kiện click để mở/đóng sidebar, fullscreen và dark mode
//     document.querySelector(".menu-button").addEventListener("click", toggleSidebar);
//     document.querySelector(".close-btn").addEventListener("click", toggleSidebar);
//     document.querySelector(".icon[onclick='toggleFullscreen()']").addEventListener("click", toggleFullscreen);
//     document.querySelector(".icon[onclick='toggleDarkMode()']").addEventListener("click", toggleDarkMode);

//     // Hiển thị preview khi chọn ảnh
//     document.getElementById("image").addEventListener("change", function () {
//         const imageFile = this.files[0];
//         const preview = document.getElementById("imagePreview");

//         if (imageFile) {
//             // Kiểm tra định dạng và kích thước ảnh
//             if (!["image/jpeg", "image/png", "image/gif"].includes(imageFile.type)) {
//                 alert("Chỉ chấp nhận các định dạng ảnh: JPEG, PNG, GIF.");
//                 this.value = "";
//                 preview.src = "";
//                 return;
//             }
//             if (imageFile.size > 5 * 1024 * 1024) { // 5MB
//                 alert("Kích thước ảnh không được vượt quá 5MB.");
//                 this.value = "";
//                 preview.src = "";
//                 return;
//             }

//             // Tạo URL để xem trước và tránh cache
//             const imageURL = URL.createObjectURL(imageFile) + "?v=" + new Date().getTime();
//             preview.src = imageURL;
//         }
//     });

//     // Hàm gửi yêu cầu API để thêm tour
//     document.querySelector("form").addEventListener("submit", function (e) {
//         e.preventDefault(); // Ngừng hành động mặc định của form

//         // Lấy dữ liệu từ form
//         const formData = new FormData();
//         formData.append("Tentour", document.getElementById("name").value);
//         formData.append("Gia", document.getElementById("price").value);
//         formData.append("Mota", document.getElementById("itinerary").value);
//         formData.append("Sokhach", document.getElementById("availability").value);

//         // Kiểm tra và thêm ảnh vào formData
//         const imageFile = document.getElementById("image").files[0];
//         if (imageFile) {
//             formData.append("imageFile", imageFile);  // Đổi từ "image" thành "imageFile"
//         }

//         // Gửi dữ liệu đến API backend tại http://localhost:5042/api/Tour/add
//         fetch("http://localhost:5042/api/Tour/add", {
//             method: "POST",
//             body: formData,
//             headers: {
//                 "Cache-Control": "no-cache",
//                 "Pragma": "no-cache",
//                 "Expires": "0"
//             }
//         })
//             .then(response => {
//                 if (!response.ok) throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
//                 return response.json();
//             })
//             .then(data => {
//                 alert("Tour đã được thêm thành công!");
//                 console.log("Dữ liệu trả về: ", data);

//                 // Gửi thông báo WebSocket đến server
//                 if (socket.readyState === WebSocket.OPEN) {
//                     socket.send("newTourAdded");
//                 }

//                 // Làm mới form sau khi gửi thành công
//                 document.querySelector("form").reset();
//                 document.getElementById("imagePreview").src = "";
//             })
//             .catch(error => {
//                 console.error("Lỗi khi gửi yêu cầu:", error);
//                 alert("Đã xảy ra lỗi: " + error.message);
//             });

//     });
// });
