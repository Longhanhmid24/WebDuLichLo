// Mã JavaScript cho các tính năng tương tác có thể được thêm vào đây

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


    // document.querySelectorAll('.carousel-cell').forEach(cell => {
    //     cell.addEventListener('click', function (event) {
    //         if (!isDragging) {
    //             var href = this.getAttribute('data-href');
    //             if (href) {
    //                 location.href = href;
    //             }
    //         }
    //     });
    // });

    // Chuyển đổi hiển thị dropdown tài khoản
    var accountIcon = document.querySelector('.account-icon');
    var accountDropdown = document.querySelector('.account-dropdown');

    accountIcon.addEventListener('click', function () {
        accountDropdown.classList.toggle('show');
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
