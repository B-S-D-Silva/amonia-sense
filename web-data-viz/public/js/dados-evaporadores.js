(function (global) {
    'use strict';

    var horarios = Array.from({ length: 24 }, function (_, hora) {
        return String(hora).padStart(2, '0') + ':00';
    });

    var evaporadores = [
        {
            id: 1,
            nome: 'Evaporador 1',
            local: 'Câmara Bovinos 01',
            sensor: 'Sensor 1',
            leiturasHoje: [
                0, 0, 0.1, 0.2, 0.2, 0.3, 0.2, 0.4, 0.3, 0.5, 0.4, 0.6,
                0.5, 0.4, 0.3, 0.2, 0.4, 0.5, 0.6, 0.7, 0.5, 0.4, 0.6, 0.8
            ]
        },
        {
            id: 2,
            nome: 'Evaporador 2',
            local: 'Câmara Bovinos 02',
            sensor: 'Sensor 2',
            leiturasHoje: [
                0.2, 0.3, 0.5, 0.8, 1.2, 1.8, 2.5, 3.2, 4.5, 6, 8, 10,
                12, 14, 16, 18, 20, 21, 22, 23, 23.5, 24, 24, 24.5
            ]
        },
        {
            id: 3,
            nome: 'Evaporador 3',
            local: 'Câmara Suínos 01',
            sensor: 'Sensor 3',
            leiturasHoje: [
                0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.2, 1.6, 2.1, 2.8, 3.5,
                4.2, 5, 5.8, 6.4, 7, 7.5, 8, 7.6, 7.1, 6.5, 6, 5.4
            ]
        },
        {
            id: 4,
            nome: 'Evaporador 4',
            local: 'Câmara Frios 01',
            sensor: 'Sensor 4',
            leiturasHoje: [
                0.2, 0.3, 0.4, 0.5, 0.7, 1, 1.4, 1.9, 2.4, 3, 3.8, 4.5,
                5.2, 6.1, 7, 8.2, 9, 10, 11, 12, 12.5, 13, 12.4, 11.8
            ]
        },
        {
            id: 5,
            nome: 'Evaporador 5',
            local: 'Câmara Aves 01',
            sensor: 'Sensor 5',
            leiturasHoje: [
                0, 0.1, 0.1, 0.2, 0.2, 0.3, 0.2, 0.2, 0.3, 0.4, 0.3, 0.2,
                0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.3, 0.4, 0.3, 0.2
            ]
        },
        {
            id: 6,
            nome: 'Evaporador 6',
            local: 'Antecâmara',
            sensor: 'Sensor 6',
            leiturasHoje: [
                0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 0.4,
                0.3, 0.3, 0.2, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.2, 0.3, 0.4
            ]
        }
    ];

    function formatarISO(data) {
        return data.getFullYear() + '-' +
            String(data.getMonth() + 1).padStart(2, '0') + '-' +
            String(data.getDate()).padStart(2, '0');
    }

    function dataHojeISO() {
        return formatarISO(new Date());
    }

    function adicionarDias(dataISO, quantidade) {
        var partes = dataISO.split('-').map(Number);
        var data = new Date(partes[0], partes[1] - 1, partes[2] + quantidade);
        return formatarISO(data);
    }

    function formatarDataBR(dataISO) {
        var partes = dataISO.split('-');
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    function rotuloData(dataISO) {
        var hoje = dataHojeISO();

        if (dataISO === hoje) return 'Hoje';
        if (dataISO === adicionarDias(hoje, -1)) return 'Ontem';
        return formatarDataBR(dataISO);
    }

    function formatarDataLonga(dataISO) {
        var partes = dataISO.split('-').map(Number);
        var data = new Date(partes[0], partes[1] - 1, partes[2]);
        var semana = [
            'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
            'quinta-feira', 'sexta-feira', 'sábado'
        ];

        return formatarDataBR(dataISO) + ' · ' + semana[data.getDay()];
    }

    function formatarPpm(valor) {
        return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    }

    function gerarSemente(texto) {
        var hash = 0;

        for (var i = 0; i < texto.length; i++) {
            hash = ((hash << 5) - hash) + texto.charCodeAt(i);
            hash |= 0;
        }

        return hash >>> 0;
    }

    function criarGerador(semente) {
        var estado = semente >>> 0;

        return function () {
            estado += 0x6D2B79F5;
            var valor = estado;
            valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
            valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
            return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
        };
    }

    function obterLeituras(evaporador, dataISO) {
        if (dataISO === dataHojeISO()) {
            return evaporador.leiturasHoje.slice();
        }

        var gerador = criarGerador(gerarSemente(evaporador.id + '|' + dataISO));
        var fator = 0.45 + (gerador() * 1.05);

        return evaporador.leiturasHoje.map(function (valor) {
            var variacao = (gerador() - 0.5) * Math.max(0.4, valor * 0.16);
            var leitura = valor * fator + variacao;

            return Math.max(0, Math.round(leitura * 10) / 10);
        });
    }

    function obterEstado(valor) {
        if (valor < 1) {
            return { rotulo: 'Estável', acao: 'Manter rotina', chave: 'stable' };
        }

        if (valor < 20) {
            return { rotulo: 'Alerta', acao: 'Verificar área', chave: 'attention' };
        }

        return { rotulo: 'Alerta crítico', acao: 'Evacuar área', chave: 'critical' };
    }

    function obterResumo(evaporador, dataISO) {
        var leituras = obterLeituras(evaporador, dataISO);
        var atual = leituras[leituras.length - 1];
        var pico = Math.max.apply(null, leituras);
        var estado = obterEstado(atual);
        var alertas = [];

        leituras.forEach(function (valor, indice) {
            var estadoLeitura = obterEstado(valor);

            if (estadoLeitura.chave !== 'stable') {
                alertas.push({
                    valor: valor,
                    horario: horarios[indice],
                    chave: estadoLeitura.chave,
                    rotulo: estadoLeitura.rotulo
                });
            }
        });

        return {
            leituras: leituras,
            atual: atual,
            pico: pico,
            estado: estado,
            alertas: alertas
        };
    }

    function obterEvaporador(id) {
        var idNumerico = Number(id);

        return evaporadores.find(function (evaporador) {
            return evaporador.id === idNumerico;
        });
    }

    global.DadosEvaporadores = {
        evaporadores: evaporadores,
        horarios: horarios,
        obterEvaporador: obterEvaporador,
        obterLeituras: obterLeituras,
        obterResumo: obterResumo,
        obterEstado: obterEstado,
        dataHojeISO: dataHojeISO,
        adicionarDias: adicionarDias,
        formatarISO: formatarISO,
        formatarDataBR: formatarDataBR,
        formatarDataLonga: formatarDataLonga,
        formatarPpm: formatarPpm,
        rotuloData: rotuloData
    };
})(window);
