const Binance = require('node-binance-api');

async function sendFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, leverage) {
  // Configuração da conexão com a API

  const binance = new Binance({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    recvWindow: 60000,
    /*
    urls: {
        base: 'https://testnet.binancefuture.com'
        // base: 'https://testnet.binance.vision/api/'
    },*/
});
  // Cria a ordem
  const orderResult = await binance.futuresBuy( 'BTCUSDT', 0.1, 8222 );
  //const orderResult = await binance.buy( 'BTCUSDT', 0.1, 8222 );

  return orderResult;
}

module.exports = sendFutureOrder;