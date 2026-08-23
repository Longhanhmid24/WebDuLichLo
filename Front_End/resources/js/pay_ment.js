/* =============================================================
   PAY_MENT.JS — Trang đặt tour / thanh toán
   Yêu cầu: config.js + scripts.js đã nạp trước.
   ============================================================= */

var appliedDiscountAmount = 0;
var appliedVoucherCode = "";

// ── Cập nhật số lượng vé ──
function updateTicket(type, change) {
    var input = document.getElementById(type);
    if (!input) return;
    var value = parseInt(input.value) || 0;
    if (value + change >= 0) {
        input.value = value + change;
        calculateTotal();
    }
}

// ── Lấy thông tin chi tiết tour ──
async function fetchTourDetail() {
    try {
        var urlParams = new URLSearchParams(window.location.search);
        var matour = urlParams.get("id");

        if (!matour) {
            document.getElementById("tour-name").textContent = "Không tìm thấy thông tin tour";
            return;
        }

        var response = await fetch(window.API_BASE_URL + "/api/Tour/get-tour");
        if (!response.ok) {
            throw new Error("Lỗi API: " + response.status);
        }

        var tours = await response.json();
        var tour = tours.find(function (t) { return t.matour == matour; });

        if (!tour) {
            document.getElementById("tour-name").textContent = "Tour không tồn tại";
            return;
        }

        // Hiển thị thông tin tour
        document.getElementById("tour-name").textContent = tour.tentour;
        document.getElementById("tour-description").textContent = tour.mota || "Chưa có mô tả chi tiết cho tour này.";

        var adultGia = tour.giaNguoiLon || tour.gia || 0;
        var childGia = tour.giaTreEm || Math.round(adultGia * 2 / 3);
        var babyGia = tour.giaTreNho || Math.round(adultGia / 2);

        document.getElementById("tour-price-adult-header").textContent = adultGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById("tour-price-adult").textContent = adultGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById("tour-price-child").textContent = childGia.toLocaleString("vi-VN") + " VNĐ";
        document.getElementById("tour-price-baby").textContent = babyGia.toLocaleString("vi-VN") + " VNĐ";

        document.getElementById("tour-start-date").textContent = window.formatDateVN(tour.ngayKhoiHanh);
        document.getElementById("tour-end-date").textContent = window.formatDateVN(tour.ngayKetThuc);
        document.getElementById("tour-seats").textContent = (tour.sokhach || 30) + " khách";
        document.getElementById("tour-loai").textContent = tour.loaiTour || "Trong nước";

        var imgElem = document.getElementById("tour-image");
        imgElem.src = window.resolveImageUrl(tour.hinhAnh, "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80");
        imgElem.alt = tour.tentour;

        window.tour = {
            matour: tour.matour,
            tentour: tour.tentour,
            mota: tour.mota,
            ngayKhoiHanh: tour.ngayKhoiHanh,
            ngayKetThuc: tour.ngayKetThuc,
            sokhach: tour.sokhach,
            hinhAnh: tour.hinhAnh,
            gia: tour.gia,
            adultGia: adultGia,
            childGia: childGia,
            babyGia: babyGia
        };

        fetchItinerary(matour);
        calculateTotal();

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tour chi tiết:", error);
    }
}

// ── Lấy lịch trình tour ──
async function fetchItinerary(matour) {
    try {
        var res = await fetch(window.API_BASE_URL + "/api/LichTrinh/tour/" + matour);
        if (!res.ok) return;
        var items = await res.json();
        if (items && items.length > 0) {
            var listElem = document.getElementById("itinerary-list");
            if (!listElem) return;
            listElem.innerHTML = items.map(function (it) {
                return '<div class="mb-3 p-3 bg-light rounded border-left border-primary" style="border-left-width: 4px !important;">' +
                    "<strong>Ngày " + it.ngayThu + ": " + it.tieuDe + "</strong>" +
                    (it.buaAn ? '<span class="badge badge-info ml-2">🍽️ Bữa ăn: ' + it.buaAn + "</span>" : "") +
                    '<p class="mb-0 text-muted mt-1" style="font-size: 0.92rem;">' + (it.chiTiet || "") + "</p>" +
                    "</div>";
            }).join("");
        }
    } catch (err) {
        console.warn("Lỗi nạp lịch trình:", err);
    }
}

// ── Tính tổng tiền ──
function calculateTotal() {
    if (!window.tour) return { subtotal: 0, finalTotal: 0 };

    var adultCount = parseInt(document.getElementById("adult").value) || 0;
    var childCount = parseInt(document.getElementById("child").value) || 0;
    var babyCount = parseInt(document.getElementById("baby").value) || 0;

    var subtotal = (window.tour.adultGia * adultCount) + (window.tour.childGia * childCount) + (window.tour.babyGia * babyCount);
    var finalTotal = Math.max(0, subtotal - appliedDiscountAmount);

    document.getElementById("subtotalPrice").textContent = subtotal.toLocaleString("vi-VN") + " VNĐ";
    document.getElementById("totalPrice").textContent = finalTotal.toLocaleString("vi-VN") + " VNĐ";

    var discountRow = document.getElementById("discount-row");
    if (discountRow) {
        if (appliedDiscountAmount > 0) {
            discountRow.style.display = "flex";
            document.getElementById("discountAmount").textContent = "-" + appliedDiscountAmount.toLocaleString("vi-VN") + " VNĐ";
        } else {
            discountRow.style.display = "none";
        }
    }

    return { subtotal: subtotal, finalTotal: finalTotal };
}

// ── Áp dụng mã giảm giá ──
async function applyVoucherCode() {
    var code = document.getElementById("voucherCode").value.trim();
    var msgElem = document.getElementById("promo-msg");
    if (!code) {
        msgElem.style.color = "#dc2626";
        msgElem.textContent = "Vui lòng nhập mã giảm giá!";
        return;
    }

    var totals = calculateTotal();
    var formData = new URLSearchParams();
    formData.append("code", code);
    formData.append("tongTien", totals.subtotal);

    try {
        var res = await fetch(window.API_BASE_URL + "/api/KhuyenMai/validate", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        var data = await res.json();
        if (res.ok) {
            appliedDiscountAmount = data.SotienGiam || 0;
            appliedVoucherCode = data.MaGiamGia || code;
            msgElem.style.color = "#16a34a";
            msgElem.textContent = "🎉 " + data.Message + " (Giảm " + appliedDiscountAmount.toLocaleString("vi-VN") + " VNĐ)";
        } else {
            appliedDiscountAmount = 0;
            appliedVoucherCode = "";
            msgElem.style.color = "#dc2626";
            msgElem.textContent = data.Message || "Mã không hợp lệ!";
        }
        calculateTotal();
    } catch (err) {
        console.error("Lỗi áp dụng mã:", err);
        msgElem.style.color = "#dc2626";
        msgElem.textContent = "Lỗi khi kiểm tra mã voucher!";
    }
}

// ── Xử lý đặt tour ──
async function processPayment() {
    var user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Bạn cần đăng nhập để đặt tour!");
        window.location.href = "html/auth/login.html";
        return;
    }

    var adultCount = parseInt(document.getElementById("adult").value) || 0;
    var childCount = parseInt(document.getElementById("child").value) || 0;
    var babyCount = parseInt(document.getElementById("baby").value) || 0;

    if (adultCount + childCount + babyCount === 0) {
        alert("Vui lòng chọn ít nhất 1 vé để thực hiện đặt tour!");
        return;
    }

    var totals = calculateTotal();
    var email = user.email;
    var matour = window.tour.matour;

    var order = {
        matour: matour,
        ngaydat: new Date().toISOString(),
        tongtien: totals.finalTotal,
        songuoi: adultCount + childCount + babyCount,
        emaildangki: email,
        maGiamGia: appliedVoucherCode || null,
        sotienGiam: appliedDiscountAmount
    };

    if (typeof window.showLoading === "function") window.showLoading("Đang khởi tạo đơn đặt tour...");

    try {
        var fetchFunc = window.getAuthFetch();
        var response = await fetchFunc(window.API_BASE_URL + "/api/Dondattour/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error("Đặt tour thất bại! Vui lòng thử lại.");
        }

        var result = await response.json();
        localStorage.setItem("order", JSON.stringify(result));
        localStorage.setItem("tour", JSON.stringify(window.tour));

        alert("🎉 Đặt tour thành công! Đang chuyển hướng đến hóa đơn...");
        window.location.href = "bill.html?matour=" + matour + "&email=" + encodeURIComponent(email);

    } catch (error) {
        console.error("Lỗi khi gửi đơn đặt tour:", error);
        alert(error.message || "Đã có lỗi xảy ra khi đặt tour.");
    } finally {
        if (typeof window.hideLoading === "function") window.hideLoading();
    }
}

// ── Khởi chạy ──
fetchTourDetail();
