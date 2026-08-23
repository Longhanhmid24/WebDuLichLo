let appliedDiscountAmount = 0;
let appliedVoucherCode = "";

function formatDateVN(dateString) {
    if (!dateString) return "---";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch {
        return dateString;
    }
}

function updateTicket(type, change) {
    let input = document.getElementById(type);
    if (input) {
        let value = parseInt(input.value) || 0;
        if (value + change >= 0) {
            input.value = value + change;
            calculateTotal();
        }
    }
}

async function fetchTourDetail() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const matour = urlParams.get('id');

        if (!matour) {
            document.getElementById('tour-name').textContent = "Không tìm thấy thông tin tour";
            return;
        }

        let response = await fetch("https://webdulichlo.onrender.com/api/Tour/get-tour");
        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

        let tours = await response.json();
        const tour = tours.find(t => t.matour == matour);

        if (!tour) {
            document.getElementById('tour-name').textContent = "Tour không tồn tại";
            return;
        }

        document.getElementById('tour-name').textContent = tour.tentour;
        document.getElementById('tour-description').textContent = tour.mota || "Chưa có mô tả chi tiết cho tour này. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.";
        
        const adultGia = tour.giaNguoiLon || tour.gia || 0;
        const childGia = tour.giaTreEm || Math.round(adultGia * 2 / 3);
        const babyGia = tour.giaTreNho || Math.round(adultGia / 2);

        document.getElementById('tour-price-adult-header').textContent = adultGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById('tour-price-adult').textContent = adultGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById('tour-price-child').textContent = childGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById('tour-price-baby').textContent = babyGia.toLocaleString("vi-VN") + " VNĐ";
        
        document.getElementById('tour-start-date').textContent = formatDateVN(tour.ngayKhoiHanh);
        document.getElementById('tour-end-date').textContent = formatDateVN(tour.ngayKetThuc);
        document.getElementById('tour-seats').textContent = (tour.sokhach || 30) + " khách";
        document.getElementById('tour-loai').textContent = tour.loaiTour || "Trong nước";

        const imgElem = document.getElementById('tour-image');
        if (tour.hinhAnh) {
            imgElem.src = tour.hinhAnh.startsWith("http") ? tour.hinhAnh : `https://webdulichlo.onrender.com${tour.hinhAnh}`;
        } else {
            imgElem.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
        }
        imgElem.alt = tour.tentour;

        window.tour = {
            ...tour,
            adultGia,
            childGia,
            babyGia
        };

        fetchItinerary(matour);
        calculateTotal();

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tour chi tiết:", error);
    }
}

async function fetchItinerary(matour) {
    try {
        const res = await fetch(`https://webdulichlo.onrender.com/api/LichTrinh/tour/${matour}`);
        if (!res.ok) return;
        const items = await res.json();
        if (items && items.length > 0) {
            const listElem = document.getElementById("itinerary-list");
            listElem.innerHTML = items.map(it => `
                <div class="mb-3 p-3 bg-light rounded border-left border-primary" style="border-left-width: 4px !important;">
                    <strong>Ngày ${it.ngayThu}: ${it.tieuDe}</strong>
                    ${it.buaAn ? `<span class="badge badge-info ml-2">🍽️ Bữa ăn: ${it.buaAn}</span>` : ""}
                    <p class="mb-0 text-muted mt-1" style="font-size: 0.92rem;">${it.chiTiet || ""}</p>
                </div>
            `).join("");
        }
    } catch (err) {
        console.warn("Lỗi nạp lịch trình:", err);
    }
}

function calculateTotal() {
    if (!window.tour) return;

    const adultCount = parseInt(document.getElementById('adult').value) || 0;
    const childCount = parseInt(document.getElementById('child').value) || 0;
    const babyCount = parseInt(document.getElementById('baby').value) || 0;

    const subtotal = (window.tour.adultGia * adultCount) + (window.tour.childGia * childCount) + (window.tour.babyGia * babyCount);
    
    let finalTotal = Math.max(0, subtotal - appliedDiscountAmount);

    document.getElementById('subtotalPrice').textContent = subtotal.toLocaleString("vi-VN") + " VNĐ";
    document.getElementById('totalPrice').textContent = finalTotal.toLocaleString("vi-VN") + " VNĐ";

    const discountRow = document.getElementById("discount-row");
    if (appliedDiscountAmount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("discountAmount").textContent = "-" + appliedDiscountAmount.toLocaleString("vi-VN") + " VNĐ";
    } else {
        discountRow.style.display = "none";
    }

    return { subtotal, finalTotal };
}

async function applyVoucherCode() {
    const code = document.getElementById("voucherCode").value.trim();
    const msgElem = document.getElementById("promo-msg");
    if (!code) {
        msgElem.style.color = "#dc2626";
        msgElem.textContent = "Vui lòng nhập mã giảm giá!";
        return;
    }

    const { subtotal } = calculateTotal();
    const formData = new URLSearchParams();
    formData.append("code", code);
    formData.append("tongTien", subtotal);

    try {
        const res = await fetch("https://webdulichlo.onrender.com/api/KhuyenMai/validate", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        const data = await res.json();
        if (res.ok) {
            appliedDiscountAmount = data.SotienGiam || 0;
            appliedVoucherCode = data.MaGiamGia || code;
            msgElem.style.color = "#16a34a";
            msgElem.textContent = `🎉 ${data.Message} (Giảm ${appliedDiscountAmount.toLocaleString("vi-VN")} VNĐ)`;
            calculateTotal();
        } else {
            appliedDiscountAmount = 0;
            appliedVoucherCode = "";
            msgElem.style.color = "#dc2626";
            msgElem.textContent = data.Message || "Mã không hợp lệ!";
            calculateTotal();
        }
    } catch (err) {
        console.error("Lỗi áp dụng mã:", err);
        msgElem.style.color = "#dc2626";
        msgElem.textContent = "Lỗi khi kiểm tra mã voucher!";
    }
}

async function processPayment() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Bạn cần đăng nhập để đặt tour!");
        window.location.href = "html/auth/login.html";
        return;
    }

    const adultCount = parseInt(document.getElementById('adult').value) || 0;
    const childCount = parseInt(document.getElementById('child').value) || 0;
    const babyCount = parseInt(document.getElementById('baby').value) || 0;

    if (adultCount + childCount + babyCount === 0) {
        alert("Vui lòng chọn ít nhất 1 vé để thực hiện đặt tour!");
        return;
    }

    const { finalTotal } = calculateTotal();
    const email = user.email;
    const matour = window.tour.matour;

    const order = {
        matour: matour,
        ngaydat: new Date().toISOString(),
        tongtien: finalTotal,
        songuoi: adultCount + childCount + babyCount,
        emaildangki: email,
        maGiamGia: appliedVoucherCode || null,
        sotienGiam: appliedDiscountAmount
    };

    if (typeof window.showLoading === "function") window.showLoading("Đang khởi tạo đơn đặt tour...");

    try {
        const fetchFunc = window.fetchWithAuth || fetch;
        const response = await fetchFunc("https://webdulichlo.onrender.com/api/Dondattour/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error("Đặt tour thất bại! Vui lòng thử lại.");
        }

        const result = await response.json();
        localStorage.setItem('order', JSON.stringify(result));
        localStorage.setItem('tour', JSON.stringify(window.tour));

        alert("🎉 Đặt tour thành công! Đang chuyển hướng đến hóa đơn...");
        window.location.href = `bill.html?matour=${matour}&email=${encodeURIComponent(email)}`;

    } catch (error) {
        console.error("Lỗi khi gửi đơn đặt tour:", error);
        alert(error.message || "Đã có lỗi xảy ra khi đặt tour.");
    } finally {
        if (typeof window.hideLoading === "function") window.hideLoading();
    }
}

fetchTourDetail();
