(function () {
    'use strict';
    var link = document.querySelector('.nav-dashboard');
    if (!link) return;

    var autenticado = false;
    try {
        autenticado = Boolean(
            sessionStorage.getItem('ID_USUARIO') &&
            sessionStorage.getItem('EMAIL_USUARIO')
        );
    } catch (_) {
        autenticado = false;
    }

    if (!autenticado) link.remove();
})();
