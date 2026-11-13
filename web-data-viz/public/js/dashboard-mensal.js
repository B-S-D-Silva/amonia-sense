(function () {
    'use strict';
    var seletor = document.getElementById('mesSelecionado');
    var calendario = document.getElementById('calendarioDias');
    var formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
    var formatoNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

    function mesValido(valor) {
        return /^\d{4}-(0[1-9]|1[0-2])$/.test(valor || '') && valor.slice(0, 4) !== '0000' &&
            valor <= DadosEvaporadores.dataHojeISO().slice(0, 7);
    }

    function atualizarSensores() {
        var ativos = DadosEvaporadores.evaporadores.filter(function (sensor) {
            // Zero ppm é uma leitura válida. Sem telemetria de conexão, esta é apenas disponibilidade simulada.
            var leituras = DadosEvaporadores.obterLeituras(sensor, DadosEvaporadores.dataHojeISO());
            return Number.isFinite(leituras[leituras.length - 1]);
        }).length;
        document.getElementById('sensoresAtivos').textContent = ativos + '/' + DadosEvaporadores.evaporadores.length;
    }

    function renderizar() {
        var hoje = DadosEvaporadores.dataHojeISO();
        seletor.max = hoje.slice(0, 7);
        if (!mesValido(seletor.value)) seletor.value = seletor.max;
        var partes = seletor.value.split('-').map(Number);
        // setFullYear também suporta corretamente anos de 0001 a 0099.
        var inicio = new Date(0);
        inicio.setHours(12, 0, 0, 0);
        inicio.setFullYear(partes[0], partes[1] - 1, 1);
        var fim = new Date(inicio);
        fim.setMonth(fim.getMonth() + 1, 0);
        var soma = 0;
        var quantidade = 0;
        var diasDisponiveis = 0;
        var diasVazamento = 0;
        var diasCriticos = 0;
        var fragmento = document.createDocumentFragment();

        for (var dia = 1; dia <= fim.getDate(); dia++) {
            var iso = seletor.value + '-' + String(dia).padStart(2, '0');
            var futuro = iso > hoje;
            var pico = null;
            if (!futuro) {
                DadosEvaporadores.evaporadores.forEach(function (sensor) {
                    DadosEvaporadores.obterLeituras(sensor, iso).forEach(function (valor) {
                        if (!Number.isFinite(valor) || valor < 0) return;
                        soma += valor;
                        quantidade++;
                        pico = pico === null ? valor : Math.max(pico, valor);
                    });
                });
                if (pico !== null) diasDisponiveis++;
            }
            var estado = pico === null ? null : DadosEvaporadores.obterEstado(pico);
            if (estado && estado.chave !== 'stable') diasVazamento++;
            if (estado && estado.chave === 'critical') diasCriticos++;
            var botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'dia-mes';
            botao.textContent = String(dia);
            if (dia === 1) botao.style.gridColumnStart = String(inicio.getDay() + 1);
            if (estado) botao.dataset.state = estado.chave;
            if (iso === hoje) {
                botao.classList.add('hoje');
                botao.setAttribute('aria-current', 'date');
            }
            var descricao = DadosEvaporadores.formatarDataBR(iso) + ' · ' +
                (futuro ? 'Data futura' : estado ? estado.rotulo : 'Sem leituras');
            botao.setAttribute('aria-label', descricao);
            botao.title = descricao;
            botao.disabled = futuro || !estado;
            botao.dataset.date = iso;
            fragmento.appendChild(botao);
        }

        calendario.replaceChildren(fragmento);
        document.getElementById('rotuloMes').textContent = formatoMes.format(inicio);
        document.getElementById('resumoPeriodo').textContent = diasDisponiveis +
            (diasDisponiveis === 1 ? ' dia com leituras' : ' dias com leituras') + ' · ' +
            formatoNumero.format(quantidade) + ' leituras demonstrativas';
        document.getElementById('mediaPpm').textContent = quantidade ? formatoNumero.format(soma / quantidade) : '—';
        document.getElementById('detalheMedia').textContent = quantidade
            ? 'Média de todas as leituras do período, incluindo zero ppm.' : 'Sem leituras disponíveis no período.';
        document.getElementById('totalVazamentos').textContent = diasDisponiveis ? String(diasVazamento) : '—';
        document.getElementById('unidadeVazamentos').textContent = diasVazamento === 1 ? 'dia' : 'dias';
        document.getElementById('detalheVazamentos').textContent = diasDisponiveis
            ? diasVazamento + ' de ' + diasDisponiveis + ' dias com leituras tiveram vazamento.' : 'Sem leituras disponíveis no período.';
        document.getElementById('cardVazamentos').dataset.state = diasCriticos ? 'critical' : diasVazamento ? 'attention' : 'stable';
        atualizarSensores();
        var url = new URL(window.location.href);
        url.searchParams.set('mes', seletor.value);
        window.history.replaceState(null, '', url);
    }

    seletor.max = DadosEvaporadores.dataHojeISO().slice(0, 7);
    var mesUrl = new URLSearchParams(window.location.search).get('mes');
    seletor.value = mesValido(mesUrl) ? mesUrl : seletor.max;
    seletor.addEventListener('change', renderizar);
    calendario.addEventListener('click', function (event) {
        var botao = event.target.closest('button[data-date]');
        if (botao && !botao.disabled) window.location.href = 'dashboard.html?data=' + botao.dataset.date;
    });
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) renderizar();
    });
    renderizar();
    window.setInterval(atualizarSensores, 30000);
})();
