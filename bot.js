const { escreveLog, escreveLogJson } = require('./log');
require('dotenv').config();
const { execQuery, getOrdens, setOrderStateDone, getAccs, saveAccOrder, saveMsg, setOrderStateClosed, getAccOnOrder } = require('./execQuery');
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
      const { id, symbol, side, type, quantity, price, leverage, status } = orden;
      escreveLog(`OrdemID: ${id}, Status: ${status}`, log_file);

      if (status == 0) {
        console.log("ABRE posição");
        const r = await setOrderStateDone(id);

        const accs = await getAccs();
        const promises = accs.map(async (acc) => {
          const { accid, apiKey, apiSecret } = acc;
          escreveLog(`ACCID: ${accid}, OrdemID: ${id}, Symbol: ${symbol} Status: ${status}`, log_file);

          // verificar procentagem de entrada

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
      } else if (status == 2) {
        console.log("Fecha posição");
        const r = await setOrderStateClosed(id);
        let side2 = null;

        const accs = await getAccOnOrder(id);
        const promises = accs.map(async (acc) => {
          const { accid, apiKey, apiSecret, quant } = acc;
         
          if(side === 'BUY'){
            side2 = 'SELL';
          }else{
            side2 = 'BUY';
          }

          escreveLog(`ACCID: ${accid}, OrdemID: ${id}, Side: ${side2} Status: ${status}`, log_file);
          
          // ENVIA ORDEM
          (async () => {
            try {
              result = await sendFutureOrder(apiKey, apiSecret, symbol, side2, type, quant, price, leverage);
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
      }

    })

    // VERIFICAR ORDENS PROGRAMADAS E ALTERAR O STATUS
    
  } catch (err) {
    console.error(err);
  }
}, process.env.SETINTERVAL);
