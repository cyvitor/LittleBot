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
            const { id, symbol, side, status, stopPrice, startPrice, startOp } = orden;
            const ticker = miniTicker.find(t => t.s === symbol);
            const tickerC = ticker?.c ? ticker.c : null;
            console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} startPrice: ${startPrice} stop: ${stopPrice} ticker = ${tickerC}`);

            if (tickerC) {
                if (status == 4) {
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
                    if (side === 'BUY') {
                        if (tickerC >= stopPrice) {
                            escreveLog(`ID: ${id} Fecha posição comprada: ${tickerC} >= ${stopPrice}`, log_file);
                            setStopOrder(id);
                        }
                    } else {
                        if (tickerC <= stopPrice) {
                            escreveLog(`ID: ${id} Fecha posição vendida: ${tickerC} <= ${stopPrice}`, log_file);
                            setStopOrder(id);
                        }
                    }
                }
            }
        })
    }
}

module.exports = { ws };