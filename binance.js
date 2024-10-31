const Binance = require('node-binance-api');
const axios = require('axios');
const crypto = require('crypto');
const ccxt = require('ccxt');

let binanceConfig

if (process.env.TEST === "TRUE") {
  binanceConfig = {
    recvWindow: 60000,
    test: process.env.TEST,
  };
} else {
  binanceConfig = {
    recvWindow: 60000,
  };
}

async function sendFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, leverage) {
  let orderResult;
  // Configuração da conexão com a API

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });
  if (leverage) {
    const leverageinfo = await binance.futuresLeverage(symbol, leverage);
    console.log(leverageinfo);
  }

  // Cria a ordem
  if (side === 'BUY') {
    if (type === 'MARKET') {
      orderResult = await binance.futuresMarketBuy(symbol, quantity);
    } else {
      orderResult = await binance.futuresBuy(symbol, quantity, price);
    }
  } else {
    if (type === 'MARKET') {
      orderResult = await binance.futuresMarketSell(symbol, quantity);
    } else {
      orderResult = await binance.futuresSell(symbol, quantity, price);
    }
  }
  console.log(orderResult);
  return orderResult;
}

async function accFuturesBalance(apiKey, apiSecret) {

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });

  const acc = await binance.futuresBalance();

  return acc;
}

async function futuresExchangeInfo(apiKey, apiSecret) {

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });

  const info = await binance.futuresExchangeInfo();
  return info;
}


async function getfuturesIncome(apiKey, apiSecret) {

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });

  const result = await binance.futuresIncome({ incomeType: "TRANSFER" });

  if ('code' in result) {
    const newResult = result;
    return newResult;
  } else {
    const newResult = result.map(item => {
      const date = new Date(item.time);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      const datatime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      return {
        ...item,
        datatime: datatime
      };
    });
    return newResult;
  }

}

async function sendFutureReduceOnly(apiKey, apiSecret, symbol, side, quantity) {
  let orderResult;
  // Configuração da conexão com a API
  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });
  // Cria a ordem
  if (side === 'BUY') {
    orderResult = await binance.futuresMarketBuy(symbol, quantity, {reduceOnly: true});
  } else {
    orderResult = await binance.futuresMarketSell(symbol, quantity, {reduceOnly: true});
  }
  console.log(orderResult);
  return orderResult;
}

async function getOrderStatus(apiKey, apiSecret, symbol, orderId) {

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });

  const info = await binance.futuresOrderStatus( symbol, {orderId: orderId} )
  return info;
}

async function getFuturesOpenOrders(apiKey, apiSecret) {

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    ...binanceConfig,
  });

  const positions = binance.futuresOpenOrders();
  return positions;

}

async function getActivePositions(apiKey, apiSecret) {
  const endpoint = 'https://fapi.binance.com/fapi/v2/account';
  const timestamp = Date.now();
  const params = `timestamp=${timestamp}&recvWindow=5000`;

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(params)
    .digest('hex');

  const url = `${endpoint}?${params}&signature=${signature}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-MBX-APIKEY': apiKey,
  };

  return axios
    .get(url, { headers })
    .then((response) => {
      const activePositions = response.data.positions.filter(
        (position) => parseFloat(position.positionAmt) !== 0
      );
      return activePositions;
    })
    .catch((error) => {
      console.error('Erro ao obter posições ativas no mercado de futuros da Binance:', error.message);
      return null;
    });
}

async function setLeverage(apiKey, apiSecret, symbol, leverage) {
  const apiUrl = "https://fapi.binance.com";

  if (!apiKey || !apiSecret)
      throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

  const data = {
    symbol: symbol,
    leverage: leverage
  };

  data.timestamp = Date.now();
  data.recvWindow = 60000; // máximo permitido, default 5000

  const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${new URLSearchParams(data)}`)
      .digest('hex');

  const qs = `?${new URLSearchParams({ ...data, signature })}`;

  try {
      const result = await axios({
          method: "POST",
          url: `${apiUrl}/fapi/v1/leverage${qs}`,
          headers: { 'X-MBX-APIKEY': apiKey }
      });
      return result.data;
  } catch (err) {
      console.error(err.response ? err.response : err);
  }
}

async function syncServerTime() {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/time');
    return response.data.serverTime;
}

async function sendFutureOrder2(apiKey, apiSecret, symbol, side, type, quantity, price, leverage) {
  const apiUrl = "https://fapi.binance.com";
  let orderResult, positionSide;

  if (side == "BUY") {
    positionSide = "LONG";
  } else {
    positionSide = "SHORT";
  }

  let data = { symbol: symbol, side: side, type: type, quantity: quantity, positionSide: positionSide };
  
  if (!apiKey || !apiSecret)
      throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
  
  const serverTime = await syncServerTime();
  data.timestamp = serverTime;
  data.recvWindow = 60000;//máximo permitido, default 5000

  const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(`${new URLSearchParams(data)}`)
      .digest('hex');

  const qs = `?${new URLSearchParams({ ...data, signature })}`;

  try {
      await setLeverage(apiKey, apiSecret, symbol, leverage);
      const result = await axios({
          method: "POST",
          url: `${apiUrl}/fapi/v1/order${qs}`,
          headers: { 'X-MBX-APIKEY': apiKey }
      });
      return result.data;
  } catch (err) {
      console.error(err.response ? err.response : err);
  }

  console.log(orderResult);
  return orderResult;
}

async function sendFutureReduceOnly2(apiKey, apiSecret, symbol, side, quantity) {

    const apiUrl = "https://fapi.binance.com";
    let orderResult, positionSide, type;
  
    if (side == "BUY") {
      positionSide = "SHORT";
      type = "BUY";
    } else {
      positionSide = "LONG";
      type = "SELL";      
    }
  
    let data = { symbol: symbol, side: type, type: "MARKET", quantity: quantity, positionSide: positionSide };
    
    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
  
    const serverTime = await syncServerTime();
    data.timestamp = serverTime;
    data.recvWindow = 60000; // máximo permitido, default 5000
  
    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');
  
    const qs = `?${new URLSearchParams({ ...data, signature })}`;
  
    try {
        const result = await axios({
            method: "POST",
            url: `${apiUrl}/fapi/v1/order${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        return result.data;
    } catch (err) {
        console.error(err.response ? err.response : err);
    }
  
    console.log(orderResult);
    return orderResult;
}

async function closeAllPositions(apiKey, apiSecret) {
  const exchange = new ccxt.binance({
      apiKey: apiKey,
      secret: apiSecret,
  });

  // Carregar mercados
  await exchange.loadMarkets();

  // Obter todas as posições abertas
  const positions = await exchange.fapiPrivate_get_positionrisk();

  // Fechar todas as posições abertas
  for (let position of positions) {
      if (position.positionAmt > 0) {
          await exchange.createOrder(position.symbol, 'market', 'sell', position.positionAmt);
      } else if (position.positionAmt < 0) {
          await exchange.createOrder(position.symbol, 'market', 'buy', -position.positionAmt);
      }
  }

  // Obter todas as ordens abertas
  const openOrders = await exchange.fetchOpenOrders();

  // Cancelar todas as ordens abertas
  for (let order of openOrders) {
      await exchange.cancelOrder(order.id, order.symbol);
  }
}

module.exports = {
  sendFutureOrder,
  accFuturesBalance,
  futuresExchangeInfo,
  getfuturesIncome,
  sendFutureReduceOnly,
  getOrderStatus,
  getFuturesOpenOrders,
  getActivePositions,
  sendFutureOrder2,
  sendFutureReduceOnly2,
  closeAllPositions
};