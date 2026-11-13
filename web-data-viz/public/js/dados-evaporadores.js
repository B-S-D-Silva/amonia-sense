(function (global) {
    'use strict';

    var horarios = Array.from({ length: 24 }, function (_, hora) {
        return String(hora).padStart(2, '0') + ':00';
    });

    var nomesMes = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    var evaporadores = [
        {
            id: 1,
            nome: 'Evaporador 1',
            sensor: 'Sensor 1',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 2,
            nome: 'Evaporador 2',
            sensor: 'Sensor 2',
            sede: 'São Paulo / Mooca',
            leiturasHoje: [
                0.2, 0.3, 0.5, 0.8, 1.2, 1.8, 2.5, 3.2, 4.5, 6, 8, 10,
                12, 14, 16, 18, 20, 21, 22, 23, 23.5, 24, 24, 24.5
            ]
        },
        {
            id: 3,
            nome: 'Evaporador 3',
            sensor: 'Sensor 3',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 4,
            nome: 'Evaporador 4',
            sensor: 'Sensor 4',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 5,
            nome: 'Evaporador 5',
            sensor: 'Sensor 5',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 6,
            nome: 'Evaporador 6',
            sensor: 'Sensor 6',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 7,
            nome: 'Evaporador 7',
            sensor: 'Sensor 7',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 8,
            nome: 'Evaporador 8',
            sensor: 'Sensor 8',
            sede: 'São Paulo / Mooca',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 9,
            nome: 'Evaporador 1',
            sensor: 'Sensor 1',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 10,
            nome: 'Evaporador 2',
            sensor: 'Sensor 2',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 11,
            nome: 'Evaporador 3',
            sensor: 'Sensor 3',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 12,
            nome: 'Evaporador 4',
            sensor: 'Sensor 4',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 13,
            nome: 'Evaporador 5',
            sensor: 'Sensor 5',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 14,
            nome: 'Evaporador 6',
            sensor: 'Sensor 6',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 15,
            nome: 'Evaporador 7',
            sensor: 'Sensor 7',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
        },
        {
            id: 16,
            nome: 'Evaporador 8',
            sensor: 'Sensor 8',
            sede: 'São Paulo / Butantã',
            leiturasHoje: Array(24).fill(0)
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

    function mesAtual() {
        var hoje = dataHojeISO();
        var partes = hoje.split('-').map(Number);
        var ano = partes[0];
        var mes = partes[1];
        var totalDias = new Date(ano, mes, 0).getDate();
        var primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
        var dias = [];

        for (var dia = 1; dia <= totalDias; dia++) {
            var iso = ano + '-' +
                String(mes).padStart(2, '0') + '-' +
                String(dia).padStart(2, '0');

            dias.push({
                dia: dia,
                iso: iso,
                futuro: iso > hoje,
                hoje: iso === hoje
            });
        }

        return {
            ano: ano,
            mes: mes,
            nome: nomesMes[mes - 1],
            inicio: dias[0].iso,
            primeiroDiaSemana: primeiroDiaSemana,
            dias: dias
        };
    }

    function obterLeituras(evaporador, dataISO) {
        if (dataISO === dataHojeISO()) {
            return evaporador.leiturasHoje.slice();
        }

        return evaporador.leiturasHoje.map(function () {
            return 0;
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

    function obterEstadoDoDia(dataISO, evaporador) {
        var ranking = { stable: 0, attention: 1, critical: 2 };
        var pior = 'stable';
        var alvos = evaporador ? [evaporador] : evaporadores;

        alvos.forEach(function (item) {
            var resumo = obterResumo(item, dataISO);
            var chave = obterEstado(resumo.pico).chave;

            if (ranking[chave] > ranking[pior]) {
                pior = chave;
            }
        });

        if (pior === 'critical') return obterEstado(20);
        if (pior === 'attention') return obterEstado(1);
        return obterEstado(0);
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
        obterEstadoDoDia: obterEstadoDoDia,
        mesAtual: mesAtual,
        dataHojeISO: dataHojeISO,
        adicionarDias: adicionarDias,
        formatarISO: formatarISO,
        formatarDataBR: formatarDataBR,
        formatarDataLonga: formatarDataLonga,
        formatarPpm: formatarPpm,
        rotuloData: rotuloData
    };
})(window);
