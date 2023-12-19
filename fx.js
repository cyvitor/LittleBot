const { escreveLog } = require('./log');
const log_file_task_sch = process.env.LOG_TASK_SCH;

function calcAmount(investment, percentage, currentPrice, decimalPlaces) {
    const result = (investment * percentage) / 100;
    const amount = result / currentPrice;
    const fator = 10 ** decimalPlaces;
    return Math.floor(amount * fator) / fator;
}

async function getInfo() {
    const { futuresExchangeInfo } = require('./binance');
    const { getFirstAcc, getAllBdSymbols, updateSymbol, insertSymbol } = require('./execQuery');
    const acc = await getFirstAcc();
    const info = await futuresExchangeInfo(acc.apiKey, acc.apiSecret);
    const allBdSymbols = await getAllBdSymbols();
    info.symbols.forEach((symbolInfo) => {
        const { symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset } = symbolInfo;
        //console.log(`${symbol}, ${status}`);

        const find = allBdSymbols.find(s => s.symbol === symbol);
        const isOnBD = find?.symbol ? find.symbol : null;

        if (isOnBD) {
            let updateBD = false;
            if (find.quantityPrecision != quantityPrecision) {
                updateBD = true;
            }
            if (find.status != status) {
                updateBD = true;
            }
            if (updateBD) {
                updateSymbol(find.symbols_id, symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset)
            }
        } else {
            insertSymbol(symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset);
        }

    });
}

async function runActionEvery30min() {
    
    while (true) {
        escreveLog ("INIT runActionEvery30min", log_file_task_sch);
        await getInfo();
        await updateAccsPositions();
        escreveLog ("END runActionEvery30min", log_file_task_sch);
        await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); // espera 30 minutos
    }
}

async function updateAccsPositions() {
    const log_file = process.env.LOG;
    const { getActivePositions } = require('./binance');
    const { saveAccPosition, getAccs, checkAccPosition, updateAccPosition } = require('./execQuery');
    const { escreveLogJson } = require('./log');
    const accs = await getAccs();
    const promises = accs.map(async (acc) => {
        const { accid, apiKey, apiSecret } = acc;
        console.log(`Verifica positions ACCID: ${accid}`);
        try {
            const positions = await getActivePositions(apiKey, apiSecret);
            if (positions.length > 0) {
                for (const position of positions) {
                    // Verifica se a posição já existe no banco de dados
                    const positionExists = await checkAccPosition(
                        accid,
                        position.symbol,
                        position.entryPrice,
                        position.positionAmt
                    );

                    if (positionExists) {
                        // Se a posição existe, atualiza os dados
                        await updateAccPosition(
                            positionExists.id,
                            position.unrealizedProfit,
                            position.bidNotional,
                            position.askNotional
                        );
                        console.log(`Posição existente atualizada: ${position.symbol}`);
                    } else {
                        // Se a posição não existe, salva no banco
                        await saveAccPosition(
                            accid,
                            position.symbol,
                            position.unrealizedProfit,
                            position.leverage,
                            position.entryPrice,
                            position.positionSide,
                            position.positionAmt,
                            new Date(position.updateTime).toISOString(),
                            position.bidNotional,
                            position.askNotional
                        );
                        console.log(`Nova posição salva: ${position.symbol}`);
                    }
                }
            }
        } catch (error) {
            escreveLogJson(`Verifica positions ACCID: ${accid}, ERROR:`, error, log_file);
        }
    });

    await Promise.all(promises);
}

async function closePositions() {
    const log_file = process.env.LOG;
    const { escreveLog, escreveLogJson } = require('./log');
    const { getPositionToClose, deleteAccPositions } = require('./execQuery');
    const { sendFutureReduceOnly2 } = require('./binance');
    const positionsToClose = await getPositionToClose();
    const promises = positionsToClose.map(async (p) => {
        const { symbol, apiKey, apiSecret, positionSide, positionAmt, id } = p;
        let side;
        if (positionSide == "LONG") {
            side = "SELL";
        } else {
            side = "BUY";
        }
        console.log(`CLOSE: ${symbol}, ${positionSide}, ${side}`);
        (async () => {
            try {
                const order = await sendFutureReduceOnly2(apiKey, apiSecret, symbol, side, positionAmt)
                console.log(order);
                await deleteAccPositions(id);
            } catch (error) {
                escreveLogJson(`ERRO fechar posicao: ${id}, ERROR:`, error, log_file);
            }
        })();
    });
    await Promise.all(promises);

    return positionsToClose;
}

module.exports = {
    runActionEvery30min,
    calcAmount,
    getInfo,
    updateAccsPositions,
    closePositions
}