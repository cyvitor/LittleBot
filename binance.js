const Binance = require('node-binance-api');

async function sendFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, leverage) {
  let orderResult;
  // Configuração da conexão com a API

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    recvWindow: 60000,
    test: process.env.TEST,
    /*
    urls: {
        base: 'https://testnet.binancefuture.com/'
        // base: 'https://testnet.binance.vision/api/'
    }*/
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
  }else{
    if (type === 'MARKET') {
      orderResult = await binance.futuresMarketSell(symbol, quantity);
    } else {
      orderResult = await binance.futuresSell(symbol, quantity, price);
    }
  }
  console.log(orderResult);
  return orderResult;
}

module.exports = {
  sendFutureOrder
};