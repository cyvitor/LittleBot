require('dotenv').config();
const { getOrdens, getOrdersProgrammed, setStartOrder, setStopOrder } = require('./execQuery');
const { escreveLog, escreveLogJson } = require('./log');
const log_file = process.env.LOG_WS;
const WebSocket = require('ws');
//const url = `${process.env.STREAM_URL}btcusdt@markPrice@1s`

function ws() {
    const url = `${process.env.STREAM_URL}!ticker@arr`
    const ws = new WebSocket(url);
    console.log(url);
    escreveLog('Init BOT WS', log_file);

    ws.onmessage = async (event) => {
        //console.clear();
        const miniTicker = JSON.parse(event.data);

        const ordens = await getOrdersProgrammed();
        ordens.forEach((orden) => {
            const { id, symbol, side, status, target1, startPrice, startOp, stopLoss } = orden;
            const ticker = miniTicker.find(t => t.s === symbol);
            const tickerC = ticker?.c ? ticker.c : null;
            //console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} startPrice: ${startPrice} target1: ${target1} ticker = ${tickerC}`);

            if (tickerC) {
                if (status == 4) {
                    console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} ticker = ${tickerC} ${startOp} startPrice: ${startPrice}`);
                    if (startOp === '<') {
                        if (tickerC <= startPrice) {
                            escreveLog(`ID: ${id} Inicia posição t1: ${tickerC} <= ${startPrice}`, log_file);
                            setStartOrder(id);
                        }
                    } else {
                        if (tickerC >= startPrice) {
                            escreveLog(`ID: ${id} Inicia posição t2: ${tickerC} >= ${startPrice}`, log_file);
                            setStartOrder(id);
                        }
                    }
                } else if (status == 5) {
                    console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} Target: ${target1} Loss: ${stopLoss}  ticker = ${tickerC} `);
                    if (side === 'BUY') {
                        if (!!target1 && tickerC >= target1) {
                            escreveLog(`ID: ${id} Fecha posição comprada: ${tickerC} >= ${target1}`, log_file);
                            setStopOrder(id);
                        } else if (!!stopLoss && tickerC <= stopLoss) {
                            escreveLog(`ID: ${id} Fecha posição comprada STOP LOSS: ${tickerC} <= ${stopLoss}`, log_file);
                            setStopOrder(id);
                        }
                    } else if (side === 'SELL') {
                        if (!!target1 && tickerC <= target1) {
                            escreveLog(`ID: ${id} Fecha posição vendida: ${tickerC} <= ${target1}`, log_file);
                            setStopOrder(id);
                        } else if (!!stopLoss && tickerC >= stopLoss) {
                            escreveLog(`ID: ${id} Fecha posição vendida STOP LOSS: ${tickerC} >= ${target1}`, log_file);
                            setStopOrder(id);
                        }
                    }
                }
            }
        })
    }
}
//ws(); // TESTE E DEBUG
module.exports = { ws };