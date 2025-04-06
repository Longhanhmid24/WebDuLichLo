
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


