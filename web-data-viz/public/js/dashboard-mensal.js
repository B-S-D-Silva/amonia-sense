(function () {
    'use strict';

    var seletorMes = document.getElementById('mesSelecionado');
    var botaoMesAnterior = document.getElementById('mesAnterior');
    var botaoMesProximo = document.getElementById('mesProximo');
    var graficoMensal = null;
    var relatorioDiario = [];
    var ultimoMesValido = '';

    var cores = {
        vazamento: '#df5b52',
        vazamentoHover: '#c4443b',
        semVazamento: '#cbd6d0',
        semVazamentoHover: '#b3c1b9'
    };

    function mesValido(valor) {
        return /^\d{4}-(0[1-9]|1[0-2])$/.test(valor || '') &&
            Number(valor.slice(0, 4)) > 0 && valor <= seletorMes.max;
    }

    function formatarMes(ano, mes) {
        var data = new Date(0);
        data.setFullYear(ano, mes - 1, 1);
        data.setHours(12, 0, 0, 0);
        return new Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
        }).format(data);
    }

    function atualizarValor(elemento, valor, unidade) {
        elemento.replaceChildren(document.createTextNode(valor + ' '));
        var detalhe = document.createElement('small');
        detalhe.textContent = unidade;
        elemento.appendChild(detalhe);
    }

    function atualizarResumoMensal() {
        var diasComVazamento = relatorioDiario.filter(function (registro) {
            return registro.vazamentos.length > 0;
        });
        var duracaoTotal = diasComVazamento.reduce(function (total, registro) {
            return total + registro.duracaoTotalMinutos;
        }, 0);
        var maiorDuracao = diasComVazamento.reduce(function (maior, registro) {
            return Math.max(maior, registro.duracaoTotalMinutos);
        }, 0);
        var temVazamento = diasComVazamento.length > 0;

        atualizarValor(
            document.getElementById('diasComVazamento'),
            String(diasComVazamento.length),
            diasComVazamento.length === 1 ? 'dia' : 'dias'
        );
        atualizarValor(
            document.getElementById('duracaoTotal'),
            RelatoriosVazamentos.formatarDuracao(duracaoTotal),
            'no mês'
        );
        atualizarValor(
            document.getElementById('maiorDuracaoDia'),
            RelatoriosVazamentos.formatarDuracao(maiorDuracao),
            'no dia'
        );

        ['cardDias', 'cardDuracao', 'cardMaior'].forEach(function (id) {
            document.getElementById(id).classList.toggle('card-alerta', temVazamento);
        });
        document.getElementById('estadoVazio').classList.toggle('visivel', !temVazamento);
    }

    function atualizarUrl() {
        var url = new URL(window.location.href);
        url.searchParams.set('mes', seletorMes.value);
        window.history.replaceState(null, '', url);
    }

    function atualizarControlesMes() {
        botaoMesProximo.disabled = seletorMes.value >= seletorMes.max;
    }

    function criarGrafico() {
        var valores = relatorioDiario.map(function (registro) {
            return registro.duracaoTotalMinutos / 60;
        });
        var coresBarras = relatorioDiario.map(function (registro) {
            return registro.vazamentos.length > 0 ? cores.vazamento : cores.semVazamento;
        });
        var coresHover = relatorioDiario.map(function (registro) {
            return registro.vazamentos.length > 0 ? cores.vazamentoHover : cores.semVazamentoHover;
        });

        if (graficoMensal) {
            graficoMensal.data.labels = relatorioDiario.map(function (registro) {
                return String(registro.dia).padStart(2, '0');
            });
            graficoMensal.data.datasets[0].data = valores;
            graficoMensal.data.datasets[0].backgroundColor = coresBarras;
            graficoMensal.data.datasets[0].hoverBackgroundColor = coresHover;
            var partesMes = seletorMes.value.split('-').map(Number);
            graficoMensal.options.scales.x.title.text = formatarMes(partesMes[0], partesMes[1]);
            graficoMensal.update();
            return;
        }

        graficoMensal = new Chart(document.getElementById('graficoMensal'), {
            type: 'bar',
            data: {
                labels: relatorioDiario.map(function (registro) {
                    return String(registro.dia).padStart(2, '0');
                }),
                datasets: [{
                    label: 'Horas de vazamento',
                    data: valores,
                    backgroundColor: coresBarras,
                    hoverBackgroundColor: coresHover,
                    borderRadius: 4,
                    minBarLength: 3
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                interaction: {
                    intersect: true,
                    mode: 'nearest'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (itens) {
                                return itens.length ? 'Dia ' + itens[0].label : '';
                            },
                            label: function (contexto) {
                                var registro = relatorioDiario[contexto.dataIndex];
                                if (registro.vazamentos.length === 0) return 'Sem vazamento';
                                var duracao = RelatoriosVazamentos.formatarDuracao(registro.duracaoTotalMinutos);
                                var quantidade = registro.vazamentos.length;
                                return duracao + ' · ' + quantidade +
                                    (quantidade === 1 ? ' ocorrência' : ' ocorrências');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: formatarMes.apply(null, seletorMes.value.split('-').map(Number)) },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Horas de vazamento' },
                        ticks: { precision: 1 }
                    }
                },
                onClick: function (evento, elementos) {
                    if (!elementos.length) return;
                    var registro = relatorioDiario[elementos[0].index];
                    if (registro) {
                        window.location.href = 'relatorio_vazamento.html?data=' +
                            encodeURIComponent(registro.dataISO);
                    }
                }
            }
        });
    }

    function atualizarGrafico() {
        if (!mesValido(seletorMes.value)) {
            seletorMes.value = ultimoMesValido;
            return;
        }

        ultimoMesValido = seletorMes.value;
        var partes = seletorMes.value.split('-').map(Number);
        relatorioDiario = RelatoriosVazamentos.criarMes(partes[0], partes[1]);
        document.getElementById('subtituloGrafico').textContent =
            'Horas totais de vazamento registradas por dia em ' + formatarMes(partes[0], partes[1]) + '.';
        atualizarResumoMensal();
        atualizarControlesMes();
        atualizarUrl();
        criarGrafico();
    }

    function mudarMes(deslocamento) {
        var partes = seletorMes.value.split('-').map(Number);
        var data = new Date(0);
        data.setHours(12, 0, 0, 0);
        data.setFullYear(partes[0], partes[1] - 1 + deslocamento, 1);
        seletorMes.value = data.getFullYear() + '-' +
            String(data.getMonth() + 1).padStart(2, '0');
        atualizarGrafico();
    }

    seletorMes.max = DadosEvaporadores.dataHojeISO().slice(0, 7);
    var mesInicial = new URLSearchParams(window.location.search).get('mes');
    seletorMes.value = mesValido(mesInicial) ? mesInicial : seletorMes.max;
    ultimoMesValido = seletorMes.value;

    seletorMes.addEventListener('change', atualizarGrafico);
    botaoMesAnterior.addEventListener('click', function () {
        mudarMes(-1);
    });
    botaoMesProximo.addEventListener('click', function () {
        if (!botaoMesProximo.disabled) mudarMes(1);
    });

    atualizarGrafico();
})();
