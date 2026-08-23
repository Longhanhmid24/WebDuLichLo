/* ============================================================
   LAYOUT.JS — Header & Footer dùng chung cho mọi trang
   (ngoài trang admin). Chèn vào trang bằng:
     <div id="site-header"></div> ... <div id="site-footer"></div>
   và nạp file này TRƯỚC scripts.js / login.js.
   ============================================================ */
(function () {
    // Xác định tiền tố đường dẫn về gốc website bằng chính thẻ <script>
    // đang nạp file này: "resources/js/layout.js" => gốc, "../../resources/..." => html/auth/
    var R = "";
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].getAttribute("src");
        if (src && src.indexOf("resources/js/layout.js") !== -1) {
            R = src.replace("resources/js/layout.js", "");
            break;
        }
    }
    window.SITE_ROOT = R;

    var headerHtml =
        '<header class="site-header bg-primary text-white py-3">' +
        '  <div class="container d-flex justify-content-start align-items-center">' +
        '    <nav class="navbar navbar-expand-lg navbar-dark">' +
        '      <a href="' + R + 'index.html" class="navbar-brand">' +
        '        <img src="' + R + 'resources/images/brand/brandlogo.png" alt="Logo DuLichVui">' +
        "      </a>" +
        '      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"' +
        '        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">' +
        '        <span class="navbar-toggler-icon"></span>' +
        "      </button>" +
        '      <div class="collapse navbar-collapse" id="navbarNav">' +
        '        <ul class="navbar-nav">' +
        '          <li class="nav-item dropdown">' +
        '            <a class="nav-link" href="' + R + 'index.html">Du Lịch</a>' +
        '            <div class="dropdown-menu">' +
        '              <a href="' + R + 'index.html#domestic">Du Lịch Trong Nước</a>' +
        '              <a href="' + R + 'index.html#international">Du Lịch Nước Ngoài</a>' +
        "            </div>" +
        "          </li>" +
        '          <li class="nav-item">' +
        '            <a class="nav-link view-orders-btn" href="#" onclick="window.goToOrderHistory && window.goToOrderHistory(event)">Lịch sử giao dịch</a>' +
        "          </li>" +
        '          <li class="nav-item"><a class="nav-link" href="' + R + 'index.html">Tours</a></li>' +
        '          <li class="nav-item"><a class="nav-link" href="' + R + 'index.html#news">Tin Tức</a></li>' +
        '          <li class="nav-item"><a class="nav-link" href="' + R + 'index.html#about">Giới Thiệu</a></li>' +
        '          <li class="nav-item account-icon dropdown">' +
        '            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Account Icon">' +
        '            <div class="dropdown-menu">' +
        '              <div id="user-info">' +
        '                <a href="' + R + 'html/auth/login.html" id="login-link">Đăng nhập</a>' +
        '                <a href="' + R + 'html/auth/register.html" id="register-link">Đăng ký</a>' +
        "              </div>" +
        "            </div>" +
        '            <span id="user-name"></span>' +
        "          </li>" +
        "        </ul>" +
        "      </div>" +
        "    </nav>" +
        "  </div>" +
        "</header>";

    var year = new Date().getFullYear();
    var footerHtml =
        '<footer class="site-footer bg-primary text-white">' +
        '  <div class="footer-grid">' +
        '    <div>' +
        '      <div class="footer-brand">' +
        '        <img src="' + R + 'resources/images/brand/brandlogo.png" alt="Logo DuLichVui">' +
        '        <span class="brand-name">DuLichVui</span>' +
        "      </div>" +
        "      <p>Đồng hành cùng bạn khám phá những điểm đến tuyệt vời trong nước và quốc tế với trải nghiệm đặt tour nhanh chóng, an toàn.</p>" +
        "    </div>" +
        '    <div>' +
        "      <h3>Khám phá</h3>" +
        "      <ul>" +
        '        <li><a href="' + R + 'index.html">Trang chủ</a></li>' +
        '        <li><a href="' + R + 'index.html#domestic">Tour trong nước</a></li>' +
        '        <li><a href="' + R + 'index.html#international">Tour nước ngoài</a></li>' +
        '        <li><a href="' + R + 'index.html#about">Giới thiệu</a></li>' +
        "      </ul>" +
        "    </div>" +
        '    <div>' +
        "      <h3>Tài khoản</h3>" +
        "      <ul>" +
        '        <li><a href="' + R + 'html/auth/login.html">Đăng nhập</a></li>' +
        '        <li><a href="' + R + 'html/auth/register.html">Đăng ký</a></li>' +
        '        <li><a href="#" class="view-orders-btn" onclick="window.goToOrderHistory && window.goToOrderHistory(event)">Lịch sử giao dịch</a></li>' +
        '        <li><a href="' + R + 'ThongTinCaNhan.html">Hồ sơ cá nhân</a></li>' +
        "      </ul>" +
        "    </div>" +
        '    <div>' +
        "      <h3>Liên hệ</h3>" +
        "      <ul>" +
        '        <li><a href="mailto:longtravel@mail.com">✉️ longtravel@mail.com</a></li>' +
        "        <li><p>📍 Việt Nam</p></li>" +
        "        <li><p>🕒 Hỗ trợ 8:00 – 22:00 hằng ngày</p></li>" +
        "      </ul>" +
        "    </div>" +
        "  </div>" +
        '  <div class="footer-bottom">' +
        "    <p>&copy; " + year + " DuLichVui — Khám Phá Thế Giới. Bảo lưu mọi quyền.</p>" +
        "  </div>" +
        "</footer>";

    function inject() {
        var h = document.getElementById("site-header");
        if (h) h.innerHTML = headerHtml;
        var f = document.getElementById("site-footer");
        if (f) f.innerHTML = footerHtml;
        if (typeof window.updateHeaderUserUI === "function") {
            window.updateHeaderUserUI();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inject);
    } else {
        inject();
    }
})();
