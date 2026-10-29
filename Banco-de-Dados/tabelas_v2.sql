DROP DATABASE IF EXISTS amonia_sense;
CREATE DATABASE amonia_sense;
USE amonia_sense;

CREATE TABLE Empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nomeFantasia VARCHAR(45) NOT NULL,
    cnpj VARCHAR(15) UNIQUE NOT NULL
);

CREATE TABLE Usuario (
	idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(40) UNIQUE NOT NULL,
	telefone VARCHAR(20) NOT NULL,
    dtNasc DATE NOT NULL,
    fkEmpresa INT,
    CONSTRAINT fkEmpresaUsuario FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa),
    fkResponsavel INT, 
    CONSTRAINT fkResponsavelUsuario FOREIGN KEY (fkResponsavel) REFERENCES Usuario(idUsuario)
);

CREATE TABLE Login (
	idLogin INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(60) NOT NULL,
    fkUsuario INT,
    CONSTRAINT fkUsuarioLogin FOREIGN KEY (fkUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE Locall (
    idLocal INT PRIMARY KEY AUTO_INCREMENT,
    UF char(2) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    endereco VARCHAR(100) NOT NULL,
    cep VARCHAR(8),
    fkEmpresa INT,
    CONSTRAINT fkEmpresaLocal FOREIGN KEY (fkEmpresa) REFERENCES Empresa (idEmpresa)
);

CREATE TABLE Sensor (
    idSensor INT PRIMARY KEY AUTO_INCREMENT,
    modelo VARCHAR(45) NOT NULL,
    tipo VARCHAR(45),
    localizacao VARCHAR(50),
    statuss VARCHAR(20),
    CONSTRAINT chkstatus CHECK (statuss IN ('Ativo', 'Inativo', 'Manutenção')),
    fkLocal INT,
    CONSTRAINT fkLocalSensor FOREIGN KEY (fkLocal) REFERENCES Locall(idLocal)
);

ALTER TABLE Sensor RENAME COLUMN localizacao TO evaporador;

-- ALTER TABLE Sensor modify column evaporador INT;

CREATE TABLE Dado_captado (
	idDado INT AUTO_INCREMENT,
    fkSensor INT,
	CONSTRAINT pkComposta PRIMARY KEY (idDado, fkSensor),
    concentracaoAmonia DECIMAL(10,2),
    dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fkDadoSensor FOREIGN KEY (fkSensor) REFERENCES Sensor(idSensor)
);

INSERT INTO Empresa VALUES
(DEFAULT, 'Frigorífico São Paulo', '12345678000101'),
(DEFAULT, 'Frigorífico Carnes Qualidade', '98765432000199');


INSERT INTO Usuario VALUES
(DEFAULT, 'Carlos Silva', '12345678900', '11999770001', 'carlos@email.com', 'Carlos/123456', '1990-05-15', 1, NULL),
(DEFAULT, 'João Santos', '98765432100', '11999550002', 'joao@email.com', 'João/123456', '1995-08-20', 1, 1),
(DEFAULT, 'Lucas Pereira', '32165498700', '11993490004', 'lucas@email.com', 'Lucas/123456', '1998-02-12', 1, 1),
(DEFAULT, 'Gabriel Souza', '65498732100', '11998590005', 'gabriel@email.com', 'Gabriel/123456', '1996-11-25', 1, 1),
(DEFAULT, 'Rafael Costa', '78912345600', '11999380006', 'rafael@email.com', 'Rafael/123456', '1992-07-18', 1, 2),
(DEFAULT, 'Marcos Oliveira', '45678912300', '11999070003', 'marcos@email.com', 'Marcos/123456', '1988-03-10', 2, NULL),
(DEFAULT, 'Felipe Almeida', '14725836900', '11999460007', 'felipe@email.com', 'Felipe/123456', '1999-04-05', 2, 6),
(DEFAULT, 'Bruno Martins', '25836914700', '11991490008', 'bruno@email.com', 'Bruno/123456', '1994-09-30', 2, 6),
(DEFAULT, 'André Lima', '36914725800', '11993890009', 'andre@email.com', 'Andre/123456', '1997-06-22', 1, 1),
(DEFAULT, 'Pedro Henrique', '74185296300', '11996590010', 'pedro@email.com', 'Pedro/123456', '1993-12-08', 1, 2);


INSERT INTO Locall VALUES
(DEFAULT, 'SP', 'São Paulo', 'Jacu-Pessegp, 1000', '03000000', 1),
(DEFAULT, 'PR', 'Curitiba', 'Av. das Indústrias, 800', '80000000', 2);

-- TRUNCATE Locall;

INSERT INTO Sensor VALUES
(DEFAULT, 'MQ-2', 'Sensor de Gás', '1', 'Ativo', 1),
(DEFAULT, 'MQ-2', 'Sensor de Gás', '2', 'Inativo', 1),
(DEFAULT, 'MQ-2', 'Sensor de Gás', '3', 'Ativo', 1),
(DEFAULT, 'MQ-2', 'Sensor de Gás', '1', 'Ativo', 2),
(DEFAULT, 'MQ-2', 'Sensor de Gás', '2', 'Ativo', 2);

-- truncate Sensor;
select * from Sensor;

INSERT INTO Dado_captado VALUES
(DEFAULT, 1, 0.00, DEFAULT),
(DEFAULT, 2, null, DEFAULT),
(DEFAULT, 3, 12.30, DEFAULT),
(DEFAULT, 4, 5.00, DEFAULT),
(DEFAULT, 5, 0.00, DEFAULT);

-- truncate Dado_captado;
-- SELECT com todas as empresas e sensores
SELECT Empresa.idEmpresa AS 'ID Empresa', Sensor.idSensor AS 'ID Sensor', Empresa.nomeFantasia AS 'Empresa', Locall.UF, Sensor.evaporador AS 'Evaporador', Dado_captado.concentracaoAmonia AS 'PPM Vazado',
CASE
	WHEN concentracaoAmonia = 0 THEN 'Normal'
    WHEN concentracaoAmonia > 0 AND concentracaoAmonia < 10 THEN 'Alerta'
    WHEN concentracaoAmonia IS NULL THEN 'Sensor Inativo'
    ELSE 'Alerta Crítico' END AS 'Estado'
FROM Empresa JOIN Locall ON fkEmpresa = idEmpresa
JOIN Sensor ON fkLocal = idLocal
JOIN Dado_captado ON fkSensor = idSensor;

-- Informações de vazamento apenas da empresa 2
SELECT Empresa.nomeFantasia AS 'Empresa', Sensor.idSensor AS 'ID Sensor', Sensor.evaporador AS 'Evaporador', Dado_captado.concentracaoAmonia AS 'PPM Vazado',
CASE
	WHEN concentracaoAmonia = 0 THEN 'Normal'
    WHEN concentracaoAmonia > 0 AND concentracaoAmonia < 10 THEN 'Alerta'
    WHEN concentracaoAmonia IS NULL THEN 'Sensor Inativo'
    ELSE 'Alerta Crítico' END AS 'Estado'
FROM Empresa JOIN Locall ON fkEmpresa = idEmpresa
JOIN Sensor ON fkLocal = idLocal
JOIN Dado_captado ON fkSensor = idSensor
WHERE Empresa.idEmpresa = 2;
