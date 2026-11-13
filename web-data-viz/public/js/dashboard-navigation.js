(function () {
    'use strict';
    var autenticado = false;
    try {
        autenticado = Boolean(
            sessionStorage.getItem('ID_USUARIO') &&
            sessionStorage.getItem('EMAIL_USUARIO')
        );
    } catch (_) {
        autenticado = false;
    }
    if (!autenticado) {
        window.location.replace('../pagina-login.html');
        return;
    }

    var sidebar = document.querySelector('.dashboard-sidebar');
    var button = document.querySelector('.sidebar-toggle');
    var mobileButton = document.querySelector('.sidebar-mobile-toggle');
    var overlay = document.querySelector('.sidebar-overlay');
    var mobile = window.matchMedia('(max-width: 900px)');
    var collapsed = false;
    try { collapsed = localStorage.getItem('amoniasense.sidebar.collapsed') === 'true'; } catch (_) { /* Armazenamento indisponível. */ }

    function updateLayout(openMobile) {
        var open = mobile.matches && openMobile;
        document.body.classList.toggle('sidebar-collapsed', !mobile.matches && collapsed);
        document.body.classList.toggle('sidebar-open', open);
        sidebar.inert = mobile.matches && !open;
        overlay.hidden = !open;
        mobileButton.setAttribute('aria-expanded', String(Boolean(open)));
        button.setAttribute('aria-expanded', String(mobile.matches ? open : !collapsed));
        button.setAttribute('aria-label', mobile.matches ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu');
    }

    button.addEventListener('click', function () {
        if (mobile.matches) {
            updateLayout(false);
            mobileButton.focus();
        } else {
            collapsed = !collapsed;
            try { localStorage.setItem('amoniasense.sidebar.collapsed', String(collapsed)); } catch (_) { /* Preferência somente nesta página. */ }
            updateLayout(false);
        }
    });
    mobileButton.addEventListener('click', function () { updateLayout(true); button.focus(); });
    overlay.addEventListener('click', function () { updateLayout(false); mobileButton.focus(); });
    mobile.addEventListener('change', function () {
        var focusInSidebar = sidebar.contains(document.activeElement);
        updateLayout(false);
        if (mobile.matches && focusInSidebar) mobileButton.focus();
    });
    document.addEventListener('keydown', function (event) {
        if (!mobile.matches || !document.body.classList.contains('sidebar-open')) return;
        if (event.key === 'Escape') { updateLayout(false); mobileButton.focus(); }
        if (event.key === 'Tab') {
            var focusable = Array.from(sidebar.querySelectorAll('a[href], button:not([hidden])')).filter(function (item) { return !item.hidden; });
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });

    var name = '';
    var signedIn = false;
    try {
        name = sessionStorage.getItem('NOME_USUARIO') || '';
        signedIn = Boolean(sessionStorage.getItem('ID_USUARIO') && sessionStorage.getItem('EMAIL_USUARIO'));
    } catch (_) { /* A visita demonstrativa não depende de armazenamento. */ }
    if (signedIn) {
        document.querySelector('.sidebar-user-name').textContent = name || 'Minha conta';
        document.querySelector('.sidebar-user-status').textContent = 'Conta conectada';
        document.querySelector('.user-avatar').textContent = (name.trim() || 'AS').split(/\s+/).slice(0, 2).map(function (part) { return part[0]; }).join('').toUpperCase();
        document.querySelector('.sidebar-login').hidden = true;
        document.querySelector('.sidebar-logout').hidden = false;
    }
    document.querySelector('.sidebar-logout').addEventListener('click', function () {
        ['EMAIL_USUARIO', 'NOME_USUARIO', 'ID_USUARIO', 'AQUARIOS', 'CAMARAS'].forEach(function (key) { sessionStorage.removeItem(key); });
        window.location.assign('../pagina-login.html');
    });
    var params = new URLSearchParams(window.location.search);
    var date = params.get('data');
    var parsed = new Date(date + 'T12:00:00');
    var now = new Date();
    var today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date || '') && !Number.isNaN(parsed.getTime()) &&
        parsed.getFullYear() === Number(date.slice(0, 4)) && parsed.getMonth() + 1 === Number(date.slice(5, 7)) &&
        parsed.getDate() === Number(date.slice(8)) && date <= today) {
        document.querySelector('[data-dashboard-link="day"]').href = 'dashboard.html?data=' + date;
        document.querySelector('[data-dashboard-link="month"]').href = 'dashboard_mensal.html?mes=' + date.slice(0, 7);
        document.querySelector('[data-dashboard-link="live"]').href = 'evaporador.html?data=' + date;
    }
    updateLayout(false);
})();
