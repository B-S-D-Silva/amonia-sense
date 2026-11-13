var alertas = [];

var API_SENSOR_GAS = 'http://localhost:3300/sensores/gas';

var leituraGas = { tick: 0, valor: undefined, tamanho: undefined };

function obterCamaras() {
    var camaras = sessionStorage.CAMARAS || sessionStorage.AQUARIOS;
    if (camaras) {
        return JSON.parse(camaras);
    }

    return [{ id: 1, descricao: 'Câmara Bovinos 01' }];
}

function mapearLeituras(bruto, limite) {
    if (!Array.isArray(bruto) || bruto.length === 0) {
        return [];
    }

    var tamanho = bruto.length;
    var maisNovo = bruto[tamanho - 1];

    if (leituraGas.tick === 0) {
        leituraGas.tick = tamanho;
    } else if (maisNovo !== leituraGas.valor || tamanho !== leituraGas.tamanho) {
        leituraGas.tick++;
    }

    leituraGas.valor = maisNovo;
    leituraGas.tamanho = tamanho;

    var inicio = Math.max(0, tamanho - limite);
    var janela = [];

    for (var i = tamanho - 1; i >= inicio; i--) {
        janela.push({
            momento_grafico: String(leituraGas.tick - (tamanho - 1 - i)),
            valor: bruto[i]
        });
    }

    return janela;
}

function obterdados(idCamara) {
    fetch(API_SENSOR_GAS)
        .then(resposta => {
            if (resposta.status == 200) {
                resposta.json().then(bruto => {

                    var leituras = mapearLeituras(bruto, 1);

                    if (leituras.length === 0) {
                        return;
                    }

                    console.log(`Dados recebidos: ${JSON.stringify(leituras)}`);

                    alertar(leituras, idCamara);
                });
            } else {
                console.error(`Nenhum dado encontrado para o id ${idCamara} ou erro na API`);
            }
        })
        .catch(function (error) {
            console.error(`Erro na obtenção dos dados da câmara p/ gráfico: ${error.message}`);
        });

}

function alertar(resposta, idCamara) {
    var temp = resposta[0].temperatura;

    var grauDeAviso = '';

    var limites = {
        muito_quente: 23,
        quente: 22,
        ideal: 20,
        frio: 10,
        muito_frio: 5
    };

    var classe_temperatura = 'cor-alerta';

    if (temp >= limites.muito_quente) {
        classe_temperatura = 'cor-alerta perigo-quente';
        grauDeAviso = 'perigo quente'
        grauDeAvisoCor = 'cor-alerta perigo-quente'
        exibirAlerta(temp, idCamara, grauDeAviso, grauDeAvisoCor)
    }
    else if (temp < limites.muito_quente && temp >= limites.quente) {
        classe_temperatura = 'cor-alerta alerta-quente';
        grauDeAviso = 'alerta quente'
        grauDeAvisoCor = 'cor-alerta alerta-quente'
        exibirAlerta(temp, idCamara, grauDeAviso, grauDeAvisoCor)
    }
    else if (temp < limites.quente && temp > limites.frio) {
        classe_temperatura = 'cor-alerta ideal';
        removerAlerta(idCamara);
    }
    else if (temp <= limites.frio && temp > limites.muito_frio) {
        classe_temperatura = 'cor-alerta alerta-frio';
        grauDeAviso = 'alerta frio'
        grauDeAvisoCor = 'cor-alerta alerta-frio'
        exibirAlerta(temp, idCamara, grauDeAviso, grauDeAvisoCor)
    }
    else if (temp <= limites.muito_frio) {
        classe_temperatura = 'cor-alerta perigo-frio';
        grauDeAviso = 'perigo frio'
        grauDeAvisoCor = 'cor-alerta perigo-frio'
        exibirAlerta(temp, idCamara, grauDeAviso, grauDeAvisoCor)
    }

    var card;

    if (Number.isFinite(temp)) {
        if (document.getElementById(`temp_camara_${idCamara}`) != null) {
            document.getElementById(`temp_camara_${idCamara}`).innerHTML = temp + "°C";
        }

        if (document.getElementById(`card_${idCamara}`)) {
            card = document.getElementById(`card_${idCamara}`)
            card.className = classe_temperatura;
        }
    }
}

function exibirAlerta(temp, idCamara, grauDeAviso, grauDeAvisoCor) {
    var indice = alertas.findIndex(item => item.idCamara == idCamara);

    if (indice >= 0) {
        alertas[indice] = { idCamara, temp, grauDeAviso, grauDeAvisoCor }
    } else {
        alertas.push({ idCamara, temp, grauDeAviso, grauDeAvisoCor });
    }

    exibirCards();
}

function removerAlerta(idCamara) {
    alertas = alertas.filter(item => item.idCamara != idCamara);
    exibirCards();
}

function exibirCards() {
    alerta.innerHTML = '';

    for (var i = 0; i < alertas.length; i++) {
        var mensagem = alertas[i];
        alerta.innerHTML += transformarEmDiv(mensagem);
    }
}

function transformarEmDiv({ idCamara, temp, grauDeAviso, grauDeAvisoCor }) {

    var descricao = obterCamaras().find(item => item.id == idCamara).descricao;
    return `
    <div class="mensagem-alarme">
        <div class="informacao">
            <div class="${grauDeAvisoCor}">&#12644;</div> 
            <h3>${descricao} está em estado de ${grauDeAviso}!</h3>
            <small>Temperatura capturada: ${temp}°C.</small>   
        </div>
        <div class="alarme-sino"></div>
    </div>
    `;
}

function atualizacaoPeriodica() {
    obterCamaras().forEach(item => {
        obterdados(item.id)
    });
    setTimeout(atualizacaoPeriodica, 5000);
}
