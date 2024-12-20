require('dotenv').config();
const WebSocket = require('ws');
const { getOrdens, getOrdersProgrammed, setStartOrder, setStopOrder, updatePrice, getOrdersOpenAndProgrammed } = require('./execQuery');
const { escreveLog } = require('./log');
const log_file = process.env.LOG_WS;

let ws;
let reconnectInterval = 1000 * 60; // Intervalo de reconexão reduzido para 1 minuto
let checkConnectionInterval = 1000 * 30; // Verifica a conexão a cada 30 segundos
let isReconnecting = false;

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
        attemptReconnect(); // Reconnexão imediata
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        escreveLog(`WebSocket error: ${error}`, log_file);
        attemptReconnect(); // Reconectar em caso de erro
    });

    ws.onmessage = async (event) => {
		try {
			const miniTicker = JSON.parse(event.data);

			const ordens = await getOrdersOpenAndProgrammed();
			ordens.forEach((orden) => {
				const { id, symbol, side, status, target1, startPrice, startOp, stopLoss } = orden;
				const ticker = miniTicker.find(t => t.s === symbol);
				const tickerC = ticker?.c ? ticker.c : null;

				if (tickerC) {
					updatePrice(id, tickerC);
					if (status == 4) {
						console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} ticker = ${tickerC} ${startOp} startPrice: ${startPrice}`);
						if (startPrice == 0) {
							setStartOrder(id, tickerC);
							escreveLog(`ID: ${id} Inicia posição NOW`, log_file);
						} else {
							if (startOp === '<' && tickerC <= startPrice) {
								escreveLog(`ID: ${id} Inicia posição t1: ${tickerC} <= ${startPrice}`, log_file);
								setStartOrder(id, tickerC);
							} else if (startOp === '>' && tickerC >= startPrice) {
								escreveLog(`ID: ${id} Inicia posição t2: ${tickerC} >= ${startPrice}`, log_file);
								setStartOrder(id, tickerC);
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
								escreveLog(`ID: ${id} Fecha posição vendida STOP LOSS: ${tickerC} >= ${stopLoss}`, log_file);
								setStopOrder(id, tickerC);
							}
						}
					}
				}
			});
		} catch (error) {
			escreveLog(`Erro ao processar mensagem WebSocket: ${error}`, log_file);
		}
    }
}

function attemptReconnect() {
    if (isReconnecting || (ws && ws.readyState === WebSocket.OPEN)) return;
    isReconnecting = true;
    console.log('Attempting to reconnect WebSocket...');
    escreveLog('Attempting to reconnect WebSocket...', log_file);
    setTimeout(() => {
        connectWebSocket();
        isReconnecting = false;
    }, reconnectInterval);
}

function checkConnection() {
    if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        console.log('WebSocket is closed or closing. Attempting to reconnect...');
        escreveLog('WebSocket is closed or closing. Attempting to reconnect...', log_file);
        attemptReconnect();
    }
}

// Verifica a conexão periodicamente a cada 30 segundos
setInterval(checkConnection, checkConnectionInterval);

// Inicia a conexão WebSocket pela primeira vez
//connectWebSocket();

module.exports = { ws: connectWebSocket };
