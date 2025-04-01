async function fetchTours() {
    try {
        let response = await fetch("https://localhost:7265/api/Tour/get-tour");
        
        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
        }

        let tours = await response.json();
        console.log("Danh sách tour nhận được:", tours);

        let tourNgoai = "";
        let tourTrongNuoc = "";

        tours.forEach(tour => {
            console.log(`Tour: ${tour.tentour}, Loại: ${tour.loaiTour}`);

            let hinhAnh = tour.hinhAnh ? tour.hinhAnh : "/images/default.jpg";

            let tourHTML = `
                <div class="tour-item">
                    <img src="${hinhAnh}" class="card-img-top" alt="${tour.tentour}" 
                        onerror="this.onerror=null; this.src='/images/default.jpg';">
                    <div class="card-body">
                        <h5 class="card-title">${tour.tentour}</h5>
                        <p class="card-text">${tour.mota || "Không có mô tả"}</p>
                        <p class="tour-price">${tour.gia.toLocaleString()} VND</p>
                        <button class="btn-book" onclick="bookTour('${tour.id}')">Đặt vé ngay</button>
                    </div>
                </div>
            `;

            if (tour.loaiTour && tour.loaiTour.toLowerCase().includes("ngoài")) {
                tourNgoai += tourHTML;
            } else {
                tourTrongNuoc += tourHTML;
            }
        });

        document.getElementById("tour-list-ngoai").innerHTML = tourNgoai;
        document.getElementById("tour-list-trongnuoc").innerHTML = tourTrongNuoc;

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
    }
}

function bookTour(tourId) {
    // Create a modal for tour registration
    const modalHTML = `
        <div id="tour-modal" class="modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <h2 style="text-align: center; color: #333;">Đăng ký tour</h2>
                <form id="tour-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" name="tourId" value="${tourId}">
                    <label for="name" style="font-weight: bold;">Họ và tên:</label>
                    <input type="text" id="name" name="name" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <label for="email" style="font-weight: bold;">Email:</label>
                    <input type="email" id="email" name="email" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <label for="phone" style="font-weight: bold;">Số điện thoại:</label>
                    <input type="tel" id="phone" name="phone" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <label for="image" style="font-weight: bold;">Chọn hình ảnh:</label>
                    <input type="file" id="image" name="image" accept="image/*" 
                        style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;" 
                        onchange="previewImage(event)">
                    <img id="image-preview" style="margin-top: 10px; max-width: 100%; border: 1px solid #ccc; border-radius: 5px; display: none;">
                    <label for="password" style="font-weight: bold;">Mật khẩu:</label>
                    <input type="password" id="password" name="password" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <button type="submit" style="padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Xác nhận
                    </button>
                </form>
            </div>
        </div>
    `;

    // Append modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Center the modal and add styling
    const modalStyle = document.createElement("style");
    modalStyle.innerHTML = `
        .modal {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 15px;
            border-radius: 10px;
            width: 600px; /* Set fixed width */
            height: 600px; /* Set fixed height */
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow-y: auto; /* Add scroll if content overflows */
        }
        .close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 18px;
            cursor: pointer;
            color: #333;
        }
        .close-btn:hover {
            color: red;
        }
        form {
            font-size: 14px;
        }
        input, button {
            font-size: 14px;
        }
    `;
    document.head.appendChild(modalStyle);

    // Add event listener to handle form submission
    document.getElementById("tour-form").addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Đăng ký thành công cho tour ID: " + tourId);
        closeModal();
    });

    // Show the modal
    document.getElementById("tour-modal").style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("tour-modal");
    if (modal) {
        modal.remove();
    }
}

// Add this function to handle image preview
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("image-preview");
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
        preview.style.display = "none";
    }
}

// Gọi hàm để tải dữ liệu tour khi trang tải xong
fetchTours();
