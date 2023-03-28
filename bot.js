const { escreveLog, escreveLogJson } = require('./log');
require('dotenv').config();
const { execQuery, getOrdens, setOrderStateDone, getAccs, saveAccOrder, saveMsg, setOrderStateClosed, getAccOnOrder, setOrdersProgrammedClose, getOrdens2 } = require('./execQuery');
const { sendFutureOrder } = require('./binance');
const { ws } = require('./bot_ws');
const { updateAccsbalances } = require('./bot_accs_b');
const log_file = process.env.LOG;
escreveLog('Init BOT', log_file);
ws();

let isUpdatingAccounts = false;

setInterval(async () => {
  try {
    // definimos o estado de execução como verdadeiro
    isUpdatingAccounts = true;
    await updateAccsbalances();
  } catch (err) {
    console.error(err);
  } finally {
    // definimos o estado de execução como falso quando a execução é concluída
    isUpdatingAccounts = false;
  }
}, process.env.SETINTERVAL_UPDATEACC);

// executar consulta a cada 5 segundos
setInterval(async () => {
  try {
    if (!isUpdatingAccounts) {
      //escreveLog('Exec', log_file);
      console.log('Exec')

      const ordens = await getOrdens2();
      //console.log(ordens);

      ordens.forEach(async (orden) => {
        const { id, symbol, side, type, quantity, price, leverage, status, target1, stopLoss, quantityPrecision, SymbolStatus } = orden;
        console.log(`OrdemID: ${id}, Status: ${status}`);

        //verificar se o price é vazio, se sim, consultar preco

        if (status == 0) {
          escreveLog(`OrdemID: ${id}, Status: ${status}`, log_file);
          console.log("ABRE posição");
          const r = await setOrderStateDone(id);

          const accs = await getAccs();
          const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment } = acc;
            escreveLog(`ACCID: ${accid}, OrdemID: ${id}, Symbol: ${symbol} Status: ${status} Price: ${price}`, log_file);
    
            const amount = calcAmount(investment, quantity, price, quantityPrecision);
            escreveLog(`ACCID: ${accid}, OrdemID: ${id}, %: ${quantity} amount: ${amount}`, log_file);
            // ENVIA ORDEM
            (async () => {
              try {
                result = await sendFutureOrder(apiKey, apiSecret, symbol, side, type, amount, price, leverage);
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
          escreveLog(`OrdemID: ${id}, Status: ${status}`, log_file);
          console.log("Fecha posição");
          const r = await setOrderStateClosed(id);
          let side2 = null;

          const accs = await getAccOnOrder(id);
          const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, quant } = acc;

            if (side === 'BUY') {
              side2 = 'SELL';
            } else {
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
        } else if (status == 1) {
          if (!!target1 || !!stopLoss) {
            setOrdersProgrammedClose(id);
            escreveLog(`OrdemID: ${id}, Target1: ${target1} Stop loss: ${stopLoss} Set status 5`, log_file);
          }
        }

      })

      // VERIFICAR ORDENS PROGRAMADAS E ALTERAR O STATUS
    }
  } catch (err) {
    console.error(err);
  }
}, process.env.SETINTERVAL);


function calcAmount(investment, percentage, currentPrice, decimalPlaces) {
  const result = (investment * percentage) / 100;
  const amount = result / currentPrice;
  const fator = 10 ** decimalPlaces;
  return Math.floor(amount * fator) / fator;
}