
document.addEventListener('DOMContentLoaded', function () {
    // Chuyển đổi menu điều hướng trên màn hình nhỏ
    var navbarToggler = document.querySelector('.navbar-toggler');
    var navbarMenu = document.querySelector('#navbarNav');

    navbarToggler.addEventListener('click', function () {
        navbarMenu.classList.toggle('collapse');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            location.href = this.getAttribute('href');
        });
    });

    // Chuyển đổi hiển thị dropdown tài khoản
    var accountIcon = document.querySelector('.account-icon');
    var accountDropdown = document.querySelector('.account-dropdown');

    accountIcon.addEventListener('click', function () {
        accountDropdown.classList.toggle('show');
    });

    // Thêm sự kiện xóa tour
    document.querySelectorAll('.delete-tour-btn').forEach(button => {
        button.addEventListener('click', function () {
            const tourItem = this.closest('.tour-item');
            const matour = tourItem.getAttribute('data-matour');
            deleteTour(matour, tourItem);
        });
    });
});

function toggleDropdown() {
    const dropdownMenu = document.querySelector('.summary .dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
}

function updateCount(type, value) {
    const countElement = document.getElementById(type);
    let count = parseInt(countElement.innerText);
    count = Math.max(0, count + value);
    countElement.innerText = count;

    // Update summary text
    document.getElementById(`${type}-summary`).innerText = count;
}
const user = JSON.parse(localStorage.getItem("user"));
const userEmail = user?.email || null;

document.querySelectorAll('.view-orders-btn').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault(); // Ngừng chuyển hướng mặc định của thẻ <a>

        if (!userEmail) {
            alert("Không có thông tin email người dùng. Vui lòng đăng nhập hoặc đặt tour trước.");
            return;
        }

        // Chuyển hướng sang list_bill.html kèm theo email
        window.location.href = `list_bill.html?email=${encodeURIComponent(userEmail)}`;
    });
});

// ===== Global Loading Helper Functions =====
window.showLoading = function (message = "Đang xử lý, vui lòng chờ...") {
    let overlay = document.getElementById("global-loading-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "global-loading-overlay";
        overlay.innerHTML = `
            <div class="loading-spinner-box">
                <div class="global-spinner"></div>
                <div class="loading-text" id="global-loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const textElem = document.getElementById("global-loading-text");
        if (textElem) textElem.textContent = message;
    }
    overlay.offsetHeight; // Force DOM reflow
    overlay.classList.add("show");
};

window.hideLoading = function () {
    const overlay = document.getElementById("global-loading-overlay");
    if (overlay) {
        overlay.classList.remove("show");
    }
};

window.setButtonLoading = function (btn, isLoading, loadingText = "Đang xử lý...") {
    if (!btn) return;
    if (isLoading) {
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.classList.add("btn-loading");
        btn.innerHTML = `<span class="btn-spinner"></span>${loadingText}`;
    } else {
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
            delete btn.dataset.originalHtml;
        }
        btn.disabled = false;
        btn.classList.remove("btn-loading");
    }
};
window.escapeHtml = function (str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

window.fetchWithAuth = async function (url, options = {}) {
    const token = localStorage.getItem("jwtToken");
    options.headers = options.headers || {};

    if (token) {
        if (options.headers instanceof Headers) {
            options.headers.set("Authorization", `Bearer ${token}`);
        } else {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        console.warn("Phiên đăng nhập hết hạn hoặc chưa xác thực!");
    } else if (response.status === 403) {
        alert("Bạn không có quyền truy cập tính năng này!");
    }

    return response;
};


