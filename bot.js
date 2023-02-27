const { escreveLog, escreveLogJson } = require('./log');
require('dotenv').config();
const { execQuery, getOrdens, setOrderStateDone, getAccs, saveAccOrder, saveMsg } = require('./execQuery');
const { sendFutureOrder } = require('./binance');
const log_file = process.env.LOG;
escreveLog('Init', log_file);

// executar consulta a cada 5 segundos
setInterval(async () => {
  try {
    //escreveLog('Exec', log_file);
    console.log('Exec')

    const ordens = await getOrdens();
    //console.log(ordens);

    ordens.forEach(async (orden) => {
      const { id, symbol, side, type, quantity, price, leverage, openClose, status } = orden;
      escreveLog(`OrdemID: ${id}, openClose: ${openClose}, Status: ${status}`, log_file);
      const r = await setOrderStateDone(id);

      const accs = await getAccs();
      const promises = accs.map(async (acc) => {
        const { accid, apiKey, apiSecret } = acc;
        escreveLog(`ACCID: ${accid}, OrdemID: ${id}, Symbol: ${symbol} Status: ${status}`, log_file);
        
        // caso fechamento de ordem, verificar se a conta entrou na ordem

        // ENVIA ORDEM
        (async () => {
          try {
            result = await sendFutureOrder(apiKey, apiSecret, symbol, side, type, quantity, price, leverage);
            escreveLogJson(`ACCID: ${accid}, OrdemID: ${id}`, result, log_file);
            if (result['orderId']) {
              saveAccOrder(accid, id, result['orderId'], result['status'], result['origQty'], result['executedQty'], result['type'], result['side']);
            } else {
              saveMsg(accid, result['msg'], result['code']);
            }
          } catch (error) {
            escreveLogJson(`ACCID: ${accid}, OrdemID: ${id}, ERROR:`, error, log_file);
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
