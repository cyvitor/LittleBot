require('dotenv').config();
const { getOrdens, getOrdersProgrammed } = require('./execQuery');
const log_file = process.env.LOG;
const WebSocket = require('ws');
//const url = `${process.env.STREAM_URL}btcusdt@markPrice@1s`
const url = `${process.env.STREAM_URL}!ticker@arr`
const ws = new WebSocket(url);
console.log(url);
escreveLog('Init', log_file);

ws.onmessage = async (event) => {
    console.clear();
    const miniTicker = JSON.parse(event.data);

    const ordens = await getOrdersProgrammed();
    ordens.forEach((orden) => {
        const { id, symbol, side, status, stopPrice, startPrice } = orden;
        const ticker = miniTicker.find(t => t.s === symbol);
        const tickerC = ticker?.c ? ticker.c : null;
        console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} startPrice: ${startPrice}  stop: ${stopPrice} ticker = ${tickerC}`);

        if (status == 4) {
            
        }
    })

}
