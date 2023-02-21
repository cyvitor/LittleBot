const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'sua_api_key',
  APISECRET: 'sua_api_secret',
});

function openFutureOrder(APIKEY, APISECRET, symbol, side, type, quantity, price, stopPrice, timeInForce) {
  binance.futuresOrder({
    symbol: symbol,
    side: side,
    type: type,
    quantity: quantity,
    price: price,
    stopPrice: stopPrice,
    timeInForce: timeInForce,
    recvWindow: 10000,
    timestamp: Date.now(),
  }, APIKEY, APISECRET, (error, response) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(response);
  });
}