-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
*/
CREATE DATABASE amoniaSense;
USE amonia;

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
	email VARCHAR(100) NOT NULL,
	senha VARCHAR(60) NOT NULL,
    dtNasc DATE NOT NULL,
    fkEmpresa INT,
    CONSTRAINT fkEmpresaUsuario FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa),
    fkResponsavel INT, 
    CONSTRAINT fkResponsavelUsuario FOREIGN KEY (fkResponsavel) REFERENCES Usuario(idUsuario)
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

/* esta tabela deve estar de acordo com o que está em INSERT de sua API do arduino - dat-acqu-ino */

create table medida (
	id INT PRIMARY KEY AUTO_INCREMENT,
	temperatura DECIMAL,
	momento DATETIME,
	fk_aquario INT,
	FOREIGN KEY (fk_aquario) REFERENCES aquario(id)
);

insert into empresa (razao_social, codigo_ativacao) values ('Empresa 1', 'ED145B');
insert into empresa (razao_social, codigo_ativacao) values ('Empresa 2', 'A1B2C3');
insert into aquario (descricao, fk_empresa) values ('Aquário de Estrela-do-mar', 1);
insert into aquario (descricao, fk_empresa) values ('Aquário de Peixe-dourado', 2);