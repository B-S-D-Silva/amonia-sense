// importa os bibliotecas necessários
const { SerialPort, ReadlineParser } = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

// constantes para configurações
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = Number(process.env.PORT) || 3300;
const PORTA_SERIAL_PADRAO = process.env.ARDUINO_PORT || process.argv[2] || null;

// habilita ou desabilita a inserção de dados no banco de dados
const HABILITAR_OPERACAO_INSERIR = true;

const normalizarIdentificador = (valor) => String(valor ?? '').replace(/^0x/i, '').toLowerCase();

// função para comunicação serial
const serial = async (
    valoresSensorGas,
) => {

    // conexão com o banco de dados MySQL
    let poolBancoDados = mysql.createPool(
        {
            host: 'localhost',
            user: 'amoniasense',
            password: 'AmoniaSense2026#',
            database: 'amonia_sense',
            port: 3307
        }
    ).promise();

    const portas = await SerialPort.list();
    let portaArduino = null;

    if (PORTA_SERIAL_PADRAO) {
        portaArduino = portas.find((porta) => porta.path === PORTA_SERIAL_PADRAO) || { path: PORTA_SERIAL_PADRAO };
    }

    if (!portaArduino) {
        portaArduino = portas.find((porta) => {
            const vendorId = normalizarIdentificador(porta.vendorId);
            const productId = normalizarIdentificador(porta.productId);
            return vendorId === '2341' && productId === '0043';
        });
    }

    if (!portaArduino) {
        console.warn('Arduino não encontrado em nenhuma porta serial. Configure ARDUINO_PORT ou passe a porta como argumento do processo.');
        return;
    }

    // configura a porta serial com o baud rate especificado
    const arduino = new SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );

    // evento quando a porta serial é aberta
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });

    // processa os dados recebidos do Arduino
arduino.pipe(new ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
    console.log(data);

    const linha = String(data).trim();
    let sensorGas;
    let leituraSensor;

    if (linha.includes(';')) {
        const valores = linha.split(';');
        leituraSensor = parseFloat(valores[0]);
        sensorGas = parseFloat(valores[1]);
    } else {
        const leituraPpm = linha.match(/^ppm\s*[:=]?\s*([-+]?\d+(?:[.,]\d+)?)/i);
        const leituraNumerica = linha.match(/^([-+]?\d+(?:[.,]\d+)?)/);
        const valorTexto = leituraPpm ? leituraPpm[1] : (leituraNumerica && !/^R0\b/i.test(linha) ? leituraNumerica[1] : null);
        sensorGas = valorTexto == null ? NaN : parseFloat(valorTexto.replace(',', '.'));
        leituraSensor = sensorGas;
    }

    if (Number.isFinite(sensorGas)) {
        valoresSensorGas.push(sensorGas);

        while (valoresSensorGas.length > 500) {
            valoresSensorGas.shift();
        }

        if (HABILITAR_OPERACAO_INSERIR) {
            await poolBancoDados.execute(
                'INSERT INTO Dado_captado (fkSensor, concentracaoAmonia) VALUES (1, ?)',
                [sensorGas]
            );

            console.log('Valor inserido no banco:', sensorGas);
        }
    } else {
        console.log('Erro: valor de PPM inválido:', data);
    }
});

    // evento para lidar com erros na comunicação serial
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem})`);
    });
}

// função para criar e configurar o servidor web
const servidor = (
    valoresSensorGas
) => {
    const app = express();
    const cssDiretorio = path.resolve(__dirname, '..', 'web-data-viz', 'public', 'css');

    // configurações de requisição e resposta
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        response.header('Access-Control-Allow-Methods', 'GET, OPTIONS');

        if (request.method === 'OPTIONS') {
            return response.sendStatus(204);
        }

        next();
    });

    app.get('/', (_, response) => {
        return response.sendFile(path.join(__dirname, 'index.html'));
    });

    app.use('/css', express.static(cssDiretorio));

    // inicia o servidor na porta especificada
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });

    // define os endpoints da API para cada tipo de sensor
    app.get('/sensores/gas', (_, response) => {
        return response.json(valoresSensorGas);
    });
}

// função principal assíncrona para iniciar a comunicação serial e o servidor web
(async () => {
    // arrays para armazenar os valores dos sensores
    const valoresSensorGas = [];

    // inicia a comunicação serial
    try {
        await serial(
            valoresSensorGas
        );
    } catch (erro) {
        console.error('Não foi possível iniciar a comunicação serial: ', erro);
    }

    // inicia o servidor web
    servidor(
        valoresSensorGas
    );
})();