require('dotenv').config();
const WebSocket = require('ws');
const { getOrdens, getOrdersProgrammed, setStartOrder, setStopOrder, updatePrice } = require('./execQuery');
const { escreveLog } = require('./log');
const log_file = process.env.LOG_WS;

let ws;
let reconnectInterval = 1000 * 60 * 60; // 1 hora para reconectar
let checkConnectionInterval = 1000 * 60; // Verifica a conexão a cada 1 minuto

function connectWebSocket() {
    escreveLog('Init BOT WS', log_file);
    const url = `${process.env.STREAM_URL}!ticker@arr`;
    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('WebSocket connected');
        escreveLog('WebSocket connected', log_file);
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        escreveLog('WebSocket disconnected, attempting to reconnect...', log_file);
        setTimeout(connectWebSocket, reconnectInterval);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        escreveLog(`WebSocket error: ${error}`, log_file);
        // Não é necessário reconectar aqui se já estamos tratando no 'close'
    });

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
                updatePrice(id, tickerC);
                if (status == 4) {
                    console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} ticker = ${tickerC} ${startOp} startPrice: ${startPrice}`);
                    if (startPrice == 0) {
                        setStartOrder(id, tickerC);
                        escreveLog(`ID: ${id} Inicia posição NOW`, log_file);
                    }else{
                        if (startOp === '<') {
                            if (tickerC <= startPrice) {
                                escreveLog(`ID: ${id} Inicia posição t1: ${tickerC} <= ${startPrice}`, log_file);
                                setStartOrder(id, tickerC);
                            }
                        } else {
                            if (tickerC >= startPrice) {
                                escreveLog(`ID: ${id} Inicia posição t2: ${tickerC} >= ${startPrice}`, log_file);
                                setStartOrder(id, tickerC);
                            }
                        }
                    }
                } else if (status == 5) {
                    console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} Target: ${target1} Loss: ${stopLoss}  ticker = ${tickerC} `);
                    if (side === 'BUY') {
                        if (!!target1 && tickerC >= target1) {
                            escreveLog(`ID: ${id} Fecha posição comprada: ${tickerC} >= ${target1}`, log_file);
                            setStopOrder(id, tickerC);
                        } else if (!!stopLoss && tickerC <= stopLoss) {
                            escreveLog(`ID: ${id} Fecha posição comprada STOP LOSS: ${tickerC} <= ${stopLoss}`, log_file);
                            setStopOrder(id, tickerC);
                        }
                    } else if (side === 'SELL') {
                        if (!!target1 && tickerC <= target1) {
                            escreveLog(`ID: ${id} Fecha posição vendida: ${tickerC} <= ${target1}`, log_file);
                            setStopOrder(id, tickerC);
                        } else if (!!stopLoss && tickerC >= stopLoss) {
                            escreveLog(`ID: ${id} Fecha posição vendida STOP LOSS: ${tickerC} >= ${target1}`, log_file);
                            setStopOrder(id, tickerC);
                        }
                    }
                }
            }
        })
    }    
}

function checkConnection() {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        console.log('WebSocket is closed. Attempting to reconnect...');
        escreveLog('WebSocket is closed. Attempting to reconnect...', log_file);
        connectWebSocket();
    }
}
// Verifica a conexão periodicamente
setInterval(checkConnection, checkConnectionInterval);

// Inicia a conexão WebSocket pela primeira vez
//connectWebSocket();

module.exports = { ws: connectWebSocket };