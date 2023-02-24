const { escreveLog, escreveLogJson } = require('./log');
require('dotenv').config();
const { execQuery, getOrdens, setOrderStateDone, getAccs } = require('./execQuery');
const { sendFutureOrder } = require('./binance');
const log_file = process.env.LOG;
escreveLog('Init', log_file);

// executar consulta a cada 5 segundos
setInterval(async () => {
  try {
    escreveLog('Exec', log_file);

    const ordens = await getOrdens();
    //console.log(ordens);

    ordens.forEach(async (orden) => {
      const { id, symbol, side, type, quantity, price, leverage, openClose, status } = orden;
      escreveLog(`Orden: ID: ${id}, openClose: ${openClose}, Status: ${status}`, log_file);
      const r = await setOrderStateDone(id);

      const accs = await getAccs();
      const promises = accs.map(async (acc) => {
        const { accid, apiKey, apiSecret } = acc;
        escreveLog(`ACC: ID: ${accid}, apiKey: ${apiKey}`, log_file);
        escreveLog(`ACC: ID: ${accid}, apiSecret: ${apiSecret}`, log_file);
        escreveLog(`ACC Orden: ID: ${id}, Symbol: ${symbol} Status: ${status}`, log_file);
        escreveLog(`ACC side: ${side}, type: ${type} quantity: ${quantity}`, log_file);

        // ENVIA ORDEM
        (async () => {
          try {
            const result = await sendFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, leverage);
            escreveLogJson(`ACC: ID: ${accid}`, result, log_file);
          } catch (error) {
            escreveLogJson(`ACC: ID: ${accid}`, error, log_file);
          }
        })();
        //
      });
      await Promise.all(promises);

    })

  } catch (err) {
    console.error(err);
  }
}, process.env.SETINTERVAL);
