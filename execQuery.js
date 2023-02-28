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
  const query = 'SELECT * FROM ordens where status IN (0, 2)';
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

async function saveAccOrder(accid, id, orderId, status, origQty, executedQty, type, side) {
  const query = `INSERT INTO accs_orders (acc_id, order_id, orderId, status, origQty, executedQty, type, side, datatime)VALUES(${accid}, ${id}, '${orderId}', '${status}', ${origQty}, ${executedQty}, '${type}', '${side}', now())`;
  const resultado = await execQuery(query);
  return resultado;
}

async function saveMsg(accid, msg, msg_code) {
  const query = `INSERT INTO acc_msg (acc_id, msg, msg_code, datatime)VALUES(${accid}, '${msg}', '${msg_code}', now())`;
  const resultado = await execQuery(query);
  return resultado;
}

async function setOrderStateClosed(id) {
  const query = 'UPDATE ordens SET status = 3 WHERE id = ' + id;
  const resultado = await execQuery(query);
  return resultado;
}

async function getAccOnOrder(id) {
  const query = 'SELECT o.acc_id as accid, o.order_id, o.origQty as quant, a.apiKey, a.apiSecret FROM accs_orders o, accs a WHERE o.acc_id=a.accid AND order_id = ' + id;
  const resultado = await execQuery(query);
  return resultado;
}

module.exports = {
  execQuery,
  getOrdens,
  setOrderStateDone,
  getAccs,
  saveAccOrder,
  saveMsg,
  setOrderStateClosed,
  getAccOnOrder
};