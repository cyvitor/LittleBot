require('dotenv').config();
const WebSocket = require('ws');
const { getOrdersSpotOpenAndProgrammed, updateSpotPrice, setStopSpotOrder, setStartSpotOrder } = require('./execQuery');
const { escreveLog } = require('./log');
const log_file = process.env.LOG_WS;

let ws;
let reconnectInterval = 1000 * 60; // Intervalo de reconexão reduzido para 1 minuto
let checkConnectionInterval = 1000 * 30; // Verifica a conexão a cada 30 segundos
let isReconnecting = false;

function connectWebSocketSpot() {
	escreveLog('Init BOT WS SPOT', log_file);
	const url = `${process.env.STREAM_URL_SPOT}!ticker@arr`;
	ws = new WebSocket(url);

	ws.on('open', () => {
		console.log('WebSocket SPOT connected');
		escreveLog('WebSocket SPOT connected', log_file);
	});

	ws.on('close', () => {
		console.log('WebSocket SPOT disconnected, attempting to reconnect...');
		escreveLog('WebSocket SPOT disconnected, attempting to reconnect...', log_file);
		attemptReconnect(); // Reconnexão imediata
	});

	ws.on('error', (error) => {
		console.error('WebSocket SPOT error:', error);
		escreveLog(`WebSocket SPOT error: ${error}`, log_file);
		attemptReconnect(); // Reconectar em caso de erro
	});

	ws.onmessage = async (event) => {
		try {
			const miniTicker = JSON.parse(event.data);

			const ordens = await getOrdersSpotOpenAndProgrammed();
			ordens.forEach((orden) => {
				const { id, symbol, side, status, target1, startPrice, startOp, stopLoss } = orden;
				const ticker = miniTicker.find(t => t.s === symbol);
				const tickerC = ticker?.c ? ticker.c : null;

				if (tickerC) {
					updateSpotPrice(id, tickerC);

					if (status == 4) {
						console.log(`ID: ${id} Symbol: ${symbol} side: ${side} st: ${status} ticker = ${tickerC} ${startOp} startPrice: ${startPrice}`);
						if (startPrice == 0) {
							setStartSpotOrder(id, tickerC);
							escreveLog(`ID: ${id} Inicia posição SPOT NOW`, log_file);
						} else {
							if (startOp === '<' && tickerC <= startPrice) {
								escreveLog(`ID: ${id} Inicia posição SPOT t1: ${tickerC} <= ${startPrice}`, log_file);
								setStartSpotOrder(id, tickerC);
							} else if (startOp === '>' && tickerC >= startPrice) {
								escreveLog(`ID: ${id} Inicia posição SPOT t2: ${tickerC} >= ${startPrice}`, log_file);
								setStartSpotOrder(id, tickerC);
							}
						}
					} else if (status == 5) {
						console.log(`ID: ${id} Symbol: ${symbol} st: ${status} Target: ${target1} Loss: ${stopLoss} ticker = ${tickerC} `);
						if (!!target1 && tickerC >= target1) {
							escreveLog(`ID: ${id} Fecha posição SPOT comprada: ${tickerC} >= ${target1}`, log_file);
							setStopSpotOrder(id, tickerC);
						} else if (!!stopLoss && tickerC <= stopLoss) {
							escreveLog(`ID: ${id} Fecha posição SPOT comprada STOP LOSS: ${tickerC} <= ${stopLoss}`, log_file);
							setStopSpotOrder(id, tickerC);
						}
					}

				}
			});
		} catch (error) {
			escreveLog(`Erro ao processar mensagem WebSocket SPOT: ${error}`, log_file);
		}
	}
}
function attemptReconnect() {
	if (isReconnecting || (ws && ws.readyState === WebSocket.OPEN)) return;
	isReconnecting = true;
	console.log('Attempting to reconnect WebSocket SPOT...');
	escreveLog('Attempting to reconnect WebSocket SPOT...', log_file);
	setTimeout(() => {
		connectWebSocketSpot();
		isReconnecting = false;
	}, reconnectInterval);
}

function checkConnection() {
	if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
		console.log('WebSocket SPOT is closed or closing. Attempting to reconnect...');
		escreveLog('WebSocket SPOT is closed or closing. Attempting to reconnect...', log_file);
		attemptReconnect();
	}
}

// Verifica a conexão periodicamente a cada 30 segundos
setInterval(checkConnection, checkConnectionInterval);

// Inicia a conexão WebSocket pela primeira vez
//connectWebSocket();

module.exports = { wsSpot: connectWebSocketSpot };
