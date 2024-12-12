const { escreveLog, escreveLogJson } = require('./log');
require('dotenv').config();
const { execQuery, getOrdens, setOrderStateDone, getAccs, saveAccOrder, saveMsg, setOrderStateClosed, getAccOnOrder, setOrdersProgrammedClose, getOrdens2, getOrdens2Spot, setOrderSpotStateDone, saveAccOrderSpot, setOrdersSpotProgrammedClose, setSpotOrderStateClosed, getAccOnOrderSpot } = require('./execQuery');
const { sendFutureOrder2, sendFutureReduceOnly2, sendSpotOrder } = require('./binance');
const { ws } = require('./bot_ws');
const { wsSpot } = require('./bot_ws_spot');
const { updateAccsbalances2, updateOrderStatus, updateAccsbalancesSpot } = require('./bot_accs_b');
const { calcAmount, runActionEvery30min, updateAccsPositions, closePositions, getDecimalPlaces, calculateAcquiredAmount} = require('./fx');
const log_file = process.env.LOG;

let isUpdatingAccounts = false;

// Variável para monitorar o último log
let lastLogTime = Date.now();

// Sobrescrever o console.log
const originalLog = console.log;
console.log = (...args) => {
  lastLogTime = Date.now(); // Atualiza o tempo do último log
  originalLog.apply(console, args);
};

// Função para verificar inatividade de logs
setInterval(() => {
  if (Date.now() - lastLogTime > 30 * 1000) { // 30 segundos sem logs
    console.error("Nenhuma atividade de log nos últimos 30 segundos. Reiniciando...");
    process.exit(1); // Força o processo a sair e o PM2 irá reiniciar
  }
}, 30 * 1000); // Verifica a cada 30 segundos

escreveLog('Init BOT', log_file);
ws();
wsSpot();

setInterval(async () => {
  try {
    isUpdatingAccounts = true;
    await updateAccsbalances2();
    await updateAccsbalancesSpot();
    await updateOrderStatus();
    await closePositions();
  } catch (err) {
    console.error(err);
  } finally {
    isUpdatingAccounts = false;
  }
}, process.env.SETINTERVAL_UPDATEACC);

setInterval(async () => {
  try {
    if (!isUpdatingAccounts) {
      console.log('Exec');
      const ordens = await getOrdens2();

      ordens.forEach(async (orden) => {
        const { id, symbol, side, type, quantity, price, leverage, status, target1, stopLoss, quantityPrecision, SymbolStatus } = orden;
        console.log(`OrdemID: ${id}, Status: ${status}`);

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
            (async () => {
              try {
                result = await sendFutureOrder2(apiKey, apiSecret, symbol, side, type, amount, price, leverage);
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

            escreveLog(`ACCID: ${accid}, OrdemID: ${id}, Side: ${side2}, Q: ${quant}, Status: ${status}`, log_file);

            (async () => {
              try {
                result = await sendFutureReduceOnly2(apiKey, apiSecret, symbol, side2, quant);
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
          });
          await Promise.all(promises);
        } else if (status == 1) {
          if (!!target1 || !!stopLoss) {
            setOrdersProgrammedClose(id);
            escreveLog(`OrdemID: ${id}, Target1: ${target1} Stop loss: ${stopLoss} Set status 5`, log_file);
          }
        }
      });

      /* BLOCO SPOT */

      const ordensSpot = await getOrdens2Spot();
  
      ordensSpot.forEach(async (ordenSpot) => {
        const { id, symbol, quantity, price, status, target1, stopLoss, minQty, SymbolStatus } = ordenSpot;
        console.log(`SpotOrdemID: ${id}, Status: ${status}`);
    
        if (status == 0) {
          escreveLog(`OrdemID: ${id}, Status: ${status}`, log_file);
          console.log("ABRE posição");
          await setOrderSpotStateDone(id);
          const accs = await getAccs();
    
          const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment_spot } = acc;
            const decimalPlaces = getDecimalPlaces(minQty);
    
            escreveLog(`ACCID: ${accid}, SpotOrdemID: ${id}, Symbol: ${symbol} Status: ${status} Price: ${price} Investment: ${investment_spot} minQty: ${minQty} decimalPlaces: ${decimalPlaces}`, log_file);
            
            const amount = calcAmount(investment_spot, quantity, price, decimalPlaces);
            escreveLog(`ACCID: ${accid}, SpotOrdemID: ${id}, %: ${quantity} amount: ${amount}`, log_file);
            
            (async () => {
              try {
                result = await sendSpotOrder(apiKey, apiSecret, symbol, "BUY", "MARKET", amount);
                const acquiredAmount = calculateAcquiredAmount(result);
                escreveLogJson(`ACCID: ${accid}, SpotOrdemID: ${id}, acquiredAmount: ${acquiredAmount} `, result, log_file);            
                
                if (result['orderId']) {
                  saveAccOrderSpot(accid, id, result['orderId'], result['origQty'], result['executedQty'], result['status'], result['type'], result['side'], result['fills'], acquiredAmount);
                } else {
                  saveMsg(accid, result['msg'], result['code']);
                }
                
              } catch (error) {
                escreveLogJson(`ACCID: ${accid}, SpotOrdemID: ${id}, ERROR:`, error, log_file);
              }
            })();
            
          });
          await Promise.all(promises);
    
        } else if (status == 2) {
          escreveLog(`SpotOrdemID: ${id}, Status: ${status}`, log_file);
          console.log("Fecha posição");
          await setSpotOrderStateClosed(id);
          const side2 = "SELL";
          const accs = await getAccOnOrderSpot(id);
          const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, quant } = acc;
            escreveLog(`ACCID: ${accid}, SpotOrdemID: ${id}, Side: ${side2}, Q: ${quant}, Status: ${status}`, log_file);
            
            (async () => {
              try {
                result = await sendSpotOrder(apiKey, apiSecret, symbol, "SELL", "MARKET", quant);
                escreveLogJson(`ACCID: ${accid}, SpotOrdemID: ${id}`, result, log_file);
                if (result['orderId']) {
                  saveAccOrderSpot(accid, id, result['orderId'], result['origQty'], result['executedQty'], result['status'], result['type'], result['side'], result['fills'], 0);
                } else {
                  saveMsg(accid, result['msg'], result['code']);
                }
              } catch (error) {
                escreveLogJson(`ACCID: ${accid}, SpotOrdemID: ${id}, ERROR:`, error, log_file);
              }
            })();
    
          });
          await Promise.all(promises);
        } else if (status == 1) {
          if (!!target1 || !!stopLoss) {
            setOrdersSpotProgrammedClose(id);
            escreveLog(`SpotOrdemID: ${id}, Target1: ${target1} Stop loss: ${stopLoss} Set status 5`, log_file);
          }
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}, process.env.SETINTERVAL);

runActionEvery30min();
