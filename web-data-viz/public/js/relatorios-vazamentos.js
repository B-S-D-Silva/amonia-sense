(function (global) {
    'use strict';

    function formatarHora(minutosDoDia) {
        return String(Math.floor(minutosDoDia / 60)).padStart(2, '0') + ':' +
            String(minutosDoDia % 60).padStart(2, '0');
    }

    function formatarDuracao(minutos) {
        var horas = Math.floor(minutos / 60);
        var restante = minutos % 60;

        if (horas === 0) return restante + ' min';
        if (restante === 0) return horas + ' h';
        return horas + ' h ' + restante + ' min';
    }

    function criarMes(ano, mes) {
        var quantidadeDias = new Date(ano, mes, 0).getDate();
        var semente = ano + mes;
        var dias = [];

        for (var dia = 1; dia <= quantidadeDias; dia++) {
            var possuiVazamento = (dia * 3 + semente) % 8 === 0 ||
                (dia + semente) % 13 === 0;
            var vazamentos = [];
            var dataISO = ano + '-' + String(mes).padStart(2, '0') + '-' +
                String(dia).padStart(2, '0');

            if (possuiVazamento) {
                var quantidade = (dia + semente) % 3 + 1;

                for (var indice = 0; indice < quantidade; indice++) {
                    var inicioMinutos = (6 + (dia * 7 + semente + indice * 5) % 16) * 60 +
                        (dia * 11 + semente * 3 + indice * 13) % 60;
                    var duracaoMinutos = 12 +
                        (dia * 17 + semente * 3 + indice * 19) % 48;

                    vazamentos.push({
                        sensor: 'Sensor ' + (1 + (dia + mes + indice * 2) % 6),
                        inicio: formatarHora(inicioMinutos),
                        fim: formatarHora(inicioMinutos + duracaoMinutos),
                        duracaoMinutos: duracaoMinutos
                    });
                }

                vazamentos.sort(function (a, b) {
                    return a.inicio.localeCompare(b.inicio);
                });
            }

            dias.push({
                dia: dia,
                dataISO: dataISO,
                vazamentos: vazamentos,
                duracaoTotalMinutos: vazamentos.reduce(function (total, vazamento) {
                    return total + vazamento.duracaoMinutos;
                }, 0)
            });
        }

        return dias;
    }

    function obterDia(dataISO) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO || '')) return null;

        var partes = dataISO.split('-').map(Number);
        var data = new Date(partes[0], partes[1] - 1, partes[2]);

        if (data.getFullYear() !== partes[0] ||
            data.getMonth() !== partes[1] - 1 ||
            data.getDate() !== partes[2]) {
            return null;
        }

        return criarMes(partes[0], partes[1])[partes[2] - 1];
    }

    global.RelatoriosVazamentos = {
        criarMes: criarMes,
        obterDia: obterDia,
        formatarDuracao: formatarDuracao
    };
})(window);
