const mysql = require('mysql2/promise');

async function execQuery(query) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
  });

  const [rows] = await connection.execute(query);

  connection.end();

  return rows;
}

async function getOrdens() {
  const query = 'SELECT * FROM ordens where status = 0';
  const resultado = await execQuery(query);
  return resultado;
}

async function setOrderStateDone(id) {
  const query = 'UPDATE ordens SET status = 1 WHERE id = ' + id;
  const resultado = await execQuery(query);
  return resultado;
}

async function getAccs() {
  const query = 'SELECT * FROM accs where status = 1';
  const resultado = await execQuery(query);
  return resultado;
}

module.exports = {
  execQuery,
  getOrdens,
  setOrderStateDone,
  getAccs
};