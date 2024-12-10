const Binance = require('node-binance-api');
const axios = require('axios');
const crypto = require('crypto');
const ccxt = require('ccxt');

let binanceConfig = {
  recvWindow: 60000,
};

if (process.env.TEST === "TRUE") {
  binanceConfig.test = true; // Não adicione valores inválidos
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

  if (side === "BUY") {
      positionSide = "LONG";
  } else {
      positionSide = "SHORT";
  }

  if (!apiKey || !apiSecret) throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

  for (let attempt = 0; attempt < 3; attempt++) {
      try {
          const serverTime = await syncServerTime();
          const data = {
              symbol,
              side,
              type,
              quantity,
              positionSide,
              timestamp: serverTime,
              recvWindow: 60000
          };

          const signature = crypto
              .createHmac('sha256', apiSecret)
              .update(`${new URLSearchParams(data)}`)
              .digest('hex');

          const qs = `?${new URLSearchParams({ ...data, signature })}`;

          await setLeverage(apiKey, apiSecret, symbol, leverage);
          const result = await axios({
              method: "POST",
              url: `${apiUrl}/fapi/v1/order${qs}`,
              headers: { 'X-MBX-APIKEY': apiKey }
          });

          return result.data;
      } catch (err) {
          if (err.response && err.response.data && err.response.data.code === -1021) {
              console.error("Erro de Timestamp - Tentando novamente...", attempt + 1);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Espera antes de tentar novamente
              continue;
          } else {
              console.error(err.response ? err.response : err);
              break;
          }
      }
  }

  return null;
}

async function sendFutureReduceOnly2(apiKey, apiSecret, symbol, side, quantity) {
  const apiUrl = "https://fapi.binance.com";
  let positionSide, type;

  if (side === "BUY") {
      positionSide = "SHORT";
      type = "BUY";
  } else {
      positionSide = "LONG";
      type = "SELL";
  }

  if (!apiKey || !apiSecret) throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

  for (let attempt = 0; attempt < 3; attempt++) {
      try {
          const serverTime = await syncServerTime();
          const data = {
              symbol,
              side: type,
              type: "MARKET",
              quantity,
              positionSide,
              timestamp: serverTime,
              recvWindow: 60000
          };

          const signature = crypto
              .createHmac('sha256', apiSecret)
              .update(`${new URLSearchParams(data)}`)
              .digest('hex');

          const qs = `?${new URLSearchParams({ ...data, signature })}`;

          const result = await axios({
              method: "POST",
              url: `${apiUrl}/fapi/v1/order${qs}`,
              headers: { 'X-MBX-APIKEY': apiKey }
          });

          return result.data;
      } catch (err) {
          if (err.response && err.response.data && err.response.data.code === -1021) {
              console.error("Erro de Timestamp - Tentando novamente...", attempt + 1);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Espera antes de tentar novamente
              continue;
          } else {
              console.error(err.response ? err.response : err);
              break;
          }
      }
  }

  return null;
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

async function sendSpotOrder(apiKey, apiSecret, symbol, side, type, quantity, price = null) {
  const apiUrl = "https://api.binance.com";
  
  if (!apiKey || !apiSecret) {
      throw new Error('Preencha corretamente sua API KEY e SECRET KEY');
  }

  for (let attempt = 0; attempt < 3; attempt++) {
      try {
          // Obtém o horário do servidor
          const serverTime = await syncServerTime();

          // Monta os dados da ordem
          const data = {
              symbol,
              side,
              type,
              quantity,
              timestamp: serverTime,
              recvWindow: 60000
          };

          // Inclui o preço somente se for uma ordem LIMIT
          if (type === "LIMIT" && price) {
              data.price = price;
              data.timeInForce = "GTC"; // Good-Till-Cancelled
          }

          // Calcula a assinatura
          const signature = crypto
              .createHmac('sha256', apiSecret)
              .update(`${new URLSearchParams(data)}`)
              .digest('hex');

          const qs = `?${new URLSearchParams({ ...data, signature })}`;

          // Envia a ordem
          const result = await axios({
              method: "POST",
              url: `${apiUrl}/api/v3/order${qs}`,
              headers: { 'X-MBX-APIKEY': apiKey }
          });

          return result.data;
      } catch (err) {
          if (err.response && err.response.data && err.response.data.code === -1021) {
              console.error("Erro de Timestamp - Tentando novamente...", attempt + 1);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda antes de tentar novamente
              continue;
          } else {
              console.error(err.response ? err.response : err);
              break;
          }
      }
  }

  return null; // Retorna null se todas as tentativas falharem
}

async function accSpotBalance(apiKey, apiSecret) {
  const baseUrl = 'https://api.binance.com';
  const endpoint = '/api/v3/account';

  try {
      // Obtém o timestamp atual
      const timestamp = Date.now();

      // Cria os parâmetros necessários
      const queryParams = new URLSearchParams({
          timestamp,
      });

      // Gera a assinatura
      const signature = crypto
          .createHmac('sha256', apiSecret)
          .update(queryParams.toString())
          .digest('hex');

      // Adiciona a assinatura nos parâmetros
      queryParams.append('signature', signature);

      // Faz a requisição para a API
      const response = await axios.get(`${baseUrl}${endpoint}?${queryParams.toString()}`, {
          headers: {
              'X-MBX-APIKEY': apiKey,
          },
      });

      // Retorna os saldos de forma organizada
      const balances = response.data.balances
          .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
          .map(balance => ({
              asset: balance.asset,
              free: parseFloat(balance.free),
              locked: parseFloat(balance.locked),
          }));

      return balances;
  } catch (err) {
      console.error('Erro ao obter saldos spot:', err.response?.data || err.message);
      throw err;
  }
}
async function getExchangeInfo() {
  const baseUrl = "https://api.binance.com/api/v3/exchangeInfo";

  try {
      const response = await fetch(baseUrl);

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Mapeia os pares com informações relevantes, incluindo o status
      const pairsInfo = data.symbols.map(pair => ({
          symbol: pair.symbol,
          baseAsset: pair.baseAsset,
          quoteAsset: pair.quoteAsset,
          status: pair.status, // Adicionado o status de trading
          tickSize: pair.filters.find(filter => filter.filterType === "PRICE_FILTER")?.tickSize || "N/A",
          minQty: pair.filters.find(filter => filter.filterType === "LOT_SIZE")?.minQty || "N/A",
      }));

      return pairsInfo;

  } catch (error) {
      console.error("Erro ao obter exchange info:", error);
      return null;
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
  closeAllPositions,
  sendSpotOrder,
  accSpotBalance,
  getExchangeInfo
};