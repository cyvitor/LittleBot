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
  try {
    const [rows] = await connection.execute(query);
    return rows;
  } finally {
    connection.release();
  }
}

async function execQuery3(query, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

async function getOrdens() {
  const query = 'SELECT * FROM ordens where status IN (0, 1, 2)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function getOrdens2() {
  const query = 'SELECT o.id, o.symbol, o.side, o.type, o.quantity, o.price, o.leverage, o.status, o.target1, o.stopLoss, s.quantityPrecision, s.status as SymbolStatus  FROM ordens o, symbols s WHERE s.symbol=o.symbol AND o.status IN (0, 1, 2)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function getOrdens2Spot() {
  const query = 'SELECT o.id, o.symbol, o.quantity, o.price, o.status, o.target1, o.stopLoss, s.minQty, s.status_spot as SymbolStatus  FROM ordens_spot o, symbols s WHERE s.symbol=o.symbol AND o.status IN (0, 1, 2)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function setOrderStateDone(id) {
  const query = 'UPDATE ordens SET status = 1 WHERE id = ?';
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function setOrderSpotStateDone(id) {
  const query = 'UPDATE ordens_spot SET status = 1 WHERE id = ?';
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function getAccs() {
  const query = 'SELECT * FROM accs where status = 1';
  const resultado = await execQuery2(query);
  return resultado;
}

// Função saveAccOrder
async function saveAccOrder(accid, id, orderId, status, origQty, executedQty, type, side) {
  const query = `INSERT INTO accs_orders (acc_id, order_id, orderId, status, origQty, executedQty, type, side, datatime)
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, now())`;
  const resultado = await execQuery3(query, [accid, id, orderId, status, origQty, executedQty, type, side]);
  return resultado;
}

// Função saveMsg
async function saveMsg(accid, msg, msg_code) {
  const query = `INSERT INTO acc_msg (acc_id, msg, msg_code, datatime)
                 VALUES(?, ?, ?, now())`;
  const resultado = await execQuery3(query, [accid, msg, msg_code]);
  return resultado;
}

// Função setOrderStateClosed
async function setOrderStateClosed(id) {
  const query = 'UPDATE ordens SET status = 3 WHERE id = ?';
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function setSpotOrderStateClosed(id) {
  const query = 'UPDATE ordens_spot SET status = 3 WHERE id = ?';
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

// Função getAccOnOrder
async function getAccOnOrder(id) {
  const query = `SELECT o.acc_id as accid, o.order_id, o.origQty as quant, a.apiKey, a.apiSecret
                 FROM accs_orders o
                 JOIN accs a ON o.acc_id = a.accid
                 WHERE o.order_id = ?`;
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function getAccOnOrderSpot(id) {
  const query = `SELECT o.acc_id as accid, o.order_spot_id, o.acquiredAmount as quant, a.apiKey, a.apiSecret
                 FROM accs_orders_spot o
                 JOIN accs a ON o.acc_id = a.accid
                 WHERE o.order_spot_id = ?`;
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function getOrdersProgrammed() {
  const query = 'SELECT * FROM ordens where status IN (4, 5)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function getOrdersOpenAndProgrammed() {
  const query = 'SELECT * FROM ordens where status IN (1, 4, 5)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function getOrdersSpotOpenAndProgrammed() {
  const query = 'SELECT * FROM ordens_spot where status IN (1, 4, 5)';
  const resultado = await execQuery2(query);
  return resultado;
}

async function setStartOrder(id, price) {
  const query = 'UPDATE ordens SET status = ?, price = ? WHERE id = ?';
  const resultado = await execQuery3(query, [0, price, id]);
  return resultado;
}

async function setStartSpotOrder(id, price) {
  const query = 'UPDATE ordens_spot SET status = ?, price = ? WHERE id = ?';
  const resultado = await execQuery3(query, [0, price, id]);
  return resultado;
}

async function setOrdersProgrammedClose(id) {
  const query = 'UPDATE ordens SET status = ? WHERE id = ?';
  const resultado = await execQuery3(query, [5, id]);
  return resultado;
}

async function setOrdersSpotProgrammedClose(id) {
  const query = 'UPDATE ordens_spot SET status = ? WHERE id = ?';
  const resultado = await execQuery3(query, [5, id]);
  return resultado;
}

async function setStopOrder(id, price) {
  const query = 'UPDATE ordens SET status = ?, price = ? WHERE id = ?';
  const resultado = await execQuery3(query, [2, price, id]);
  return resultado;
}

async function setStopSpotOrder(id, price) {
  const query = 'UPDATE ordens_spot SET status = ?, price = ? WHERE id = ?';
  const resultado = await execQuery3(query, [2, price, id]);
  return resultado;
}

async function updateBalance(accid, asset, balance, availableBalance) {
  let changed = false;

  // Query para selecionar o registro existente
  const querySelect = 'SELECT * FROM accs_balances WHERE accid = ? AND asset = ?';
  const resultado = await execQuery3(querySelect, [accid, asset]);

  if (resultado.length > 0) {
    // Verifica se os valores de balance e availableBalance precisam ser atualizados
    if (resultado[0]["balance"] != balance || resultado[0]["availableBalance"] != availableBalance) {
      // Query para atualizar o registro existente
      const queryUpdate = 'UPDATE accs_balances SET balance = ?, availableBalance = ?, datatime = now() WHERE accid = ? AND asset = ?';
      await execQuery3(queryUpdate, [balance, availableBalance, accid, asset]);
      changed = true;
    }
  } else {
    // Insere um novo registro se os valores de balance e availableBalance forem maiores que 0
    if (balance > 0 && availableBalance > 0) {
      const queryInsert = 'INSERT INTO accs_balances (accid, asset, balance, availableBalance, datatime) VALUES (?, ?, ?, ?, now())';
      await execQuery3(queryInsert, [accid, asset, balance, availableBalance]);
      changed = true;
    }
  }

  return changed;
}

async function updateBalanceSpot(accid, asset, free, locked) {
  let changed, a = false;

  // Query para selecionar o registro existente
  const querySelect = 'SELECT * FROM accs_balances_spot WHERE accid = ? AND asset = ?';
  const resultado = await execQuery3(querySelect, [accid, asset]);
  
  if (resultado.length > 0) {
    // Verifica se os valores de free e locked precisam ser atualizados
    if (resultado[0]["free"] != free || resultado[0]["locked"] != locked) {
      // Query para atualizar o registro existente
      const queryUpdate = 'UPDATE accs_balances_spot SET free = ?, locked = ?, datatime = now() WHERE accid = ? AND asset = ?';
      await execQuery3(queryUpdate, [free, locked, accid, asset]);
      changed = true;
      a = "update";
    }
  } else {
    // Insere um novo registro se os valores de free e locked forem maiores que 0
    if (free > 0) {
      const queryInsert = 'INSERT INTO accs_balances_spot (accid, asset, free, locked, datatime) VALUES (?, ?, ?, ?, now())';
      const r = await execQuery3(queryInsert, [accid, asset, free, locked]);
      changed = true;
      a = "insert";
    }
  }
  return changed;
}

async function updateAccInvestiment(accid, investment) {
  const invest = Math.floor(investment * 100) / 100;
  const query = `UPDATE accs SET investment = '${invest}' WHERE accid = ${accid}`;
  const resultado = await execQuery2(query);
  return resultado;
}

async function updateAccSpotInvestiment(accid, investment_spot) {
  const invest = Math.floor(investment_spot * 100) / 100;
  const query = `UPDATE accs SET investment_spot = '${invest}' WHERE accid = ${accid}`;
  const resultado = await execQuery2(query);
  return resultado;
}
async function clearSymbols() {
  const query = "TRUNCATE symbols;"
  const result = await execQuery2(query);
  return result;
}

async function insertSymbol(symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset) {
  const query = `INSERT INTO symbols (symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset)VALUES('${symbol}', '${quantityPrecision}', '${baseAssetPrecision}', '${quotePrecision}', '${status}', '${baseAsset}', '${quoteAsset}')`;
  const result = await execQuery2(query);
  return result;
}

async function insertSpotSymbol(symbol, minQty, tickSize, status_spot) {
  const query = `
    INSERT INTO symbols (
      symbol,
      minQty,
      tickSize,
      status_spot
    )
    VALUES (?, ?, ?, ?)
  `;
  const params = [symbol, minQty, tickSize, status_spot];
  const result = await execQuery3(query, params);
  return result;
}


async function updateSymbol(id, symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset) {
  const query = `UPDATE symbols SET symbol = '${symbol}', quantityPrecision = '${quantityPrecision}', baseAssetPrecision = '${baseAssetPrecision}', quotePrecision = '${quotePrecision}', status = '${status}', baseAsset = '${baseAsset}', quoteAsset = '${quoteAsset}' WHERE symbols_id = ${id}`;
  const result = await execQuery2(query);
  return result;
}

async function updateSpotSymbol(id, minQty, tickSize, status_spot) {
  const query = `
    UPDATE symbols
    SET
      minQty = ?,
      tickSize = ?,
      status_spot = ?
    WHERE symbols_id = ?
  `;
  const params = [minQty, tickSize, status_spot, id];
  const result = await execQuery3(query, params);
  return result;
}

async function getAllBdSymbols() {
  const query = `SELECT symbols_id, symbol, status, quantityPrecision, tickSize, minQty, status_spot FROM symbols`;
  const result = await execQuery2(query);
  return result;
}

async function updatePrice(id, price) {
  const query = `UPDATE ordens SET price = ? WHERE id = ?`;
  const resultado = await execQuery3(query, [price, id]);
  return resultado;
}

async function updateSpotPrice(id, price) {
  const query = `UPDATE ordens_spot SET price = ? WHERE id = ?`;
  const resultado = await execQuery3(query, [price, id]);
  return resultado;
}

async function getAcc(id) {
  const query = 'SELECT * FROM accs where accid = ' + id;
  const resultado = await execQuery2(query);
  return resultado[0];
}

async function getFirstAcc() {
  const query = 'SELECT * FROM accs WHERE status = 1 LIMIT 1';
  const resultado = await execQuery2(query);
  return resultado[0];
}

async function getNewOrders() {
  const query = 'SELECT o.accs_orders_id, o.orderId, s.symbol, o.status, a.accid, a.apiKey, a.apiSecret FROM accs_orders o, ordens s, accs a WHERE s.id=o.order_id AND a.accid=o.acc_id AND a.status = 1 AND o.status <> "FILLED"';
  const resultado = await execQuery2(query);
  return resultado;
}

async function updateOrder(id, status, executedQty, avgPrice) {
  const query = `UPDATE accs_orders SET status = ?, executedQty = ?, avgPrice = ? WHERE accs_orders_id = ?`;
  const resultado = await execQuery3(query, [status, executedQty, avgPrice, id]);
  return resultado;
}

async function saveAccOrderOpen(accid, orderId, symbol, status, price, avgPrice, origQty, executedQty, type, reduceOnly, closePosition, side, positionSide, stopPrice, time) {
  const query = `
    INSERT INTO accs_orders_open (
      acc_id,
      order_id,
      symbol,
      status,
      price,
      avgPrice,
      origQty,
      executedQty,
      type,
      reduceOnly,
      closePosition,
      side,
      positionSide,
      stopPrice,
      time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const resultado = await execQuery3(query, [accid, orderId, symbol, status, price, avgPrice, origQty, executedQty, type, reduceOnly, closePosition, side, positionSide, stopPrice, time]);
  return resultado;
}

async function check_orders_open(orderId) {
  const query = `SELECT COUNT(*) AS count FROM accs_orders_open WHERE order_id = ?`;
  const result = await execQuery3(query, [orderId]);
  return result[0].count > 0;
}

async function saveAccPosition(accid, symbol, unrealizedProfit, leverage, entryPrice, positionSide, positionAmt, updateTime, bidNotional, askNotional) {
  const query = `
    INSERT INTO accs_positions (
      acc_id,
      symbol,
      unrealizedProfit,
      leverage,
      entryPrice,
      positionSide,
      positionAmt,
      updateTime,
      bidNotional,
      askNotional
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const resultado = await execQuery3(query, [accid, symbol, unrealizedProfit, leverage, entryPrice, positionSide, positionAmt, updateTime, bidNotional, askNotional]);
  return resultado;
}

async function checkAccPosition(accid, symbol, entryPrice, positionAmt) {
  const query = `
    SELECT *
    FROM accs_positions
    WHERE acc_id = ?
      AND symbol = ?
      AND entryPrice = ?
      AND positionAmt = ?`;

  const result = await execQuery3(query, [accid, symbol, entryPrice, positionAmt]);

  return result.length > 0 ? result[0] : false;
}

async function updateAccPosition(id, unrealizedProfit, bidNotional, askNotional) {
  const query = `
    UPDATE accs_positions
    SET
      unrealizedProfit = ?,
      bidNotional = ?,
      askNotional = ?
    WHERE id = ?`;

  const resultado = await execQuery3(query, [unrealizedProfit, bidNotional, askNotional, id]);
  return resultado;
}

async function deleteAccPositions(id) {
  const query = `DELETE FROM accs_positions WHERE id = ?`;
  const resultado = await execQuery3(query, [id]);
  return resultado;
}

async function clearAccPositions(accid) {
  const query = `DELETE FROM accs_positions WHERE acc_id = ?`;
  const resultado = await execQuery3(query, [accid]);
  return resultado;
}

async function getPositionToClose() {
  const query = `SELECT p.id, p.symbol, p.positionSide, p.positionAmt, a.apiKey, a.apiSecret FROM accs_positions p, accs a WHERE p.acc_id=a.accid AND p.bot_status = 2`;
  const resultado = await execQuery2(query);
  return resultado;
}

async function saveAccOrderSpot(
  acc_id,
  order_spot_id,
  orderId,
  origQty,
  executedQty,
  status,
  type,
  side,
  fills,
  acquiredAmount,
  price
) {
  const query = `
    INSERT INTO accs_orders_spot 
    (acc_id, order_spot_id, orderId, origQty, executedQty, status, type, side, fills, acquiredAmount, price, datatime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const params = [
    acc_id,
    order_spot_id,
    orderId,
    parseFloat(origQty), // Garante que seja número
    parseFloat(executedQty), // Garante que seja número
    status,
    type,
    side,
    JSON.stringify(fills), // Converte para string JSON
    parseFloat(acquiredAmount), // Garante que seja número
    parseFloat(price)
  ];

  try {
    const result = await execQuery3(query, params);
    return result.insertId; // Retorna o ID do registro inserido
  } catch (error) {
    console.error("Error inserting into accs_orders_spot:", error);
    throw error;
  }
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
  updateSymbol,
  getAllBdSymbols,
  getOrdens2,
  updatePrice,
  getAcc,
  getFirstAcc,
  getNewOrders,
  updateOrder,
  saveAccOrderOpen,
  check_orders_open,
  saveAccPosition,
  clearAccPositions,
  getPositionToClose,
  checkAccPosition,
  updateAccPosition,
  deleteAccPositions,
  getOrdersOpenAndProgrammed,
  updateBalanceSpot,
  updateAccSpotInvestiment,
  getOrdens2Spot,
  setOrderSpotStateDone,
  insertSpotSymbol,
  updateSpotSymbol,
  saveAccOrderSpot,
  setOrdersSpotProgrammedClose,
  getOrdersSpotOpenAndProgrammed,
  updateSpotPrice,
  setStopSpotOrder,
  setStartSpotOrder,
  setSpotOrderStateClosed,
  getAccOnOrderSpot
};