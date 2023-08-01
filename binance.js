const Binance = require('node-binance-api');
const axios = require('axios');
const crypto = require('crypto');

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

module.exports = {
  sendFutureOrder,
  accFuturesBalance,
  futuresExchangeInfo,
  getfuturesIncome,
  sendFutureReduceOnly,
  getOrderStatus
};