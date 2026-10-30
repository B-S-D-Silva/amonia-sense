var database = require("../database/config");

function autenticar(email, senha) {
    var instrucaoSql = `
        SELECT u.idUsuario AS id, u.nome, l.email, u.fkEmpresa AS empresaId
        FROM Usuario u
        INNER JOIN Login l ON l.fkUsuario = u.idUsuario
        WHERE l.email = ? AND l.senha = ?;
    `;

    return database.executar(instrucaoSql, [email, senha]);
}

async function cadastrar(nome, documento, telefone, email, dtNasc, senha, fkEmpresa) {
    var resultadoUsuario = await database.executar(`
        INSERT INTO Usuario (nome, documento, telefone, dtNasc, fkEmpresa)
        VALUES (?, ?, ?, ?, ?);
    `, [nome, documento, telefone, dtNasc, fkEmpresa]);

    var idUsuario = resultadoUsuario.insertId;

    await database.executar(`
        INSERT INTO Login (email, senha, fkUsuario)
        VALUES (?, ?, ?);
    `, [email, senha, idUsuario]);

    return resultadoUsuario;
}

module.exports = {
    autenticar,
    cadastrar
};
