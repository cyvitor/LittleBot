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

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function execQuery2(query) {
  const connection = await pool.getConnection();
  const [rows] = await connection.execute(query);
  connection.release();
  return rows;
}

async function getOrdens() {
  const query = 'SELECT * FROM ordens where status IN (0, 1, 2)';
  const resultado = await execQuery(query);
  return resultado;
}

async function getOrdens2() {
  const query = 'SELECT o.id, o.symbol, o.side, o.type, o.quantity, o.price, o.leverage, o.status, o.target1, o.stopLoss, s.quantityPrecision, s.status as SymbolStatus  FROM ordens o, symbols s WHERE s.symbol=o.symbol AND o.status IN (0, 1, 2)';
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

async function getOrdersProgrammed() {
  const query = 'SELECT * FROM ordens where status IN (4, 5)';
  const resultado = await execQuery(query);
  return resultado;
}

async function setStartOrder(id, price) {
  const query = `UPDATE ordens SET status = 0, price = '${price}' WHERE id = ${id}`;
  const resultado = await execQuery(query);
  return resultado;
}

async function setOrdersProgrammedClose(id) {
  const query = 'UPDATE ordens SET status = 5 WHERE id = ' + id;
  const resultado = await execQuery(query);
  return resultado;
}

async function setStopOrder(id, price) {
  const query = `UPDATE ordens SET status = 2, price = ${price} WHERE id = ${id}`;
  const resultado = await execQuery(query);
  return resultado;
}

async function updateBalance(accid, asset, balance, availableBalance) {
  const query = `SELECT * FROM accs_balances WHERE accid = ${accid} AND asset = '${asset}'`;
  const resultado = await execQuery2(query);
  if (resultado.length > 0) {
    const queryUpdate = `UPDATE accs_balances SET balance = '${balance}', availableBalance = '${availableBalance}', datatime = now() WHERE accid = ${accid} AND asset = '${asset}' `;
    const resultado1 = await execQuery2(queryUpdate);
  } else {
    if (balance > 0 && availableBalance > 0) {
      const queryInsert = `INSERT INTO accs_balances (accid, asset, balance, availableBalance, datatime)VALUES(${accid}, '${asset}', '${balance}', '${availableBalance}', now())`;
      const resultado1 = await execQuery2(queryInsert);
    }
  }
  return resultado;
}

async function updateAccInvestiment(accid, investment) {
  const invest = Math.floor(investment * 100) / 100;
  const query = `UPDATE accs SET investment = '${invest}' WHERE accid = ${accid}`;
  const resultado = await execQuery(query);
  return resultado;
}

async function clearSymbols() {
  const query = "TRUNCATE symbols;"
  const result = await execQuery(query);
  return result;
}

async function insertSymbol(symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset) {
  const query = `INSERT INTO symbols (symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset)VALUES('${symbol}', '${quantityPrecision}', '${baseAssetPrecision}', '${quotePrecision}', '${status}', '${baseAsset}', '${quoteAsset}')`;
  const result = await execQuery2(query);
  return result;
}

async function updatePrice(id, price) {
  const query = `UPDATE ordens SET price = ${price} WHERE id = ${id}`;
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
  getAccOnOrder,
  getOrdersProgrammed,
  setStartOrder,
  setOrdersProgrammedClose,
  setStopOrder,
  updateBalance,
  updateAccInvestiment,
  clearSymbols,
  insertSymbol,
  getOrdens2,
  updatePrice
};