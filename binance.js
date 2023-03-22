const Binance = require('node-binance-api');

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

module.exports = {
  sendFutureOrder,
  accFuturesBalance,
  futuresExchangeInfo
};