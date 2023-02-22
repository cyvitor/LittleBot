const Binance = require('node-binance-api');
const binance = new Binance().options({});

async function openFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, stopPrice, leverage, testnet = false) {
  // Configuração da conexão com a API
  binance.options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    useServerTime: true,
    test: testnet
  });

  const orderParams = {
    symbol: symbol,
    side: side,
    positionSide: 'BOTH',
    type: type,
    quantity: quantity,
    price: price,
    stopPrice: stopPrice,
    timeInForce: 'GTC',
    reduceOnly: false,
    closePosition: false,
    workingType: 'CONTRACT_PRICE',
    priceProtect: false,
    newOrderRespType: 'ACK',
    recvWindow: 5000
  };

  if (type === 'TRAILING_STOP_MARKET') {
    delete orderParams.price;
  }

  // Define a alavancagem
  const marginType = leverage > 1 ? 'CROSSED' : 'ISOLATED';
  const leverageResult = await binance.futuresLeverage(symbol, leverage, marginType);

  // Cria a ordem
  const orderResult = await binance.futuresOrder(orderParams);

  return orderResult;
}

module.exports = openFutureOrder;