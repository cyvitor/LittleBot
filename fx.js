const { escreveLog } = require('./log');
const log_file_task_sch = process.env.LOG_TASK_SCH;

function calcAmount(investment, percentage, currentPrice, decimalPlaces) {
    const result = (investment * percentage) / 100;
    const amount = result / currentPrice;

    if (decimalPlaces === 0) {
        // Se decimalPlaces for zero, arredondar para o número inteiro mais próximo
        return Math.floor(amount); // ou Math.round(amount) se quiser arredondar para o valor mais próximo
    }

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

async function getSpotInfo() {
    const { getExchangeInfo } = require('./binance');
    const { getAllBdSymbols, insertSpotSymbol, updateSpotSymbol } = require('./execQuery');
    const info = await getExchangeInfo();
    const allBdSymbols = await getAllBdSymbols();
    info.forEach((symbolInfo) => {
        const { symbol, tickSize, minQty, status } = symbolInfo;
        //console.log(`${symbol}, ${minQty}, ${tickSize}, ${status}`);
  
        const find = allBdSymbols.find(s => s.symbol === symbol);
        const isOnBD = find?.symbol ? find.symbol : null;
  
        if (isOnBD) {
            let updateBD = false;
            if (find.minQty != minQty) {
                updateBD = true;
            }
            if (updateBD) {
                console.log("UPDATE");
                updateSpotSymbol(find.symbols_id, minQty, tickSize, status);
            }
        } else {
            console.log("INSERT");
            insertSpotSymbol(symbol, minQty, tickSize, status);
        }
  
    });
  }

async function runActionEvery30min() {

    while (true) {
        escreveLog("INIT runActionEvery30min", log_file_task_sch);
        await getInfo();
        await getSpotInfo();
        //await updateAccsPositions();
        escreveLog("END runActionEvery30min", log_file_task_sch);
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

function getDecimalPlaces(minQty) {
    // Verifica se o valor é uma string válida
    if (typeof minQty !== "string") {
      throw new Error("O valor fornecido não é uma string válida.");
    }
  
    // Verifica se contém ponto decimal
    if (!minQty.includes(".")) {
      return 0; // Sem casas decimais
    }
  
    // Remove os zeros à direita e divide na parte inteira e decimal
    const trimmed = minQty.replace(/0+$/, "");
    const [, decimals] = trimmed.split(".");
  
    // Retorna o comprimento da parte decimal, ou 0 se não houver
    return decimals ? decimals.length : 0;
}

function calculateAcquiredAmount(result) {
    // Extrair informações relevantes do objeto
    const executedQty = parseFloat(result.executedQty); // Quantidade executada
    const executedQtyStr = result.executedQty; // Quantidade executada como string

    // Determinar o número de casas decimais válidas
    const decimalPlaces = executedQtyStr.includes('.') 
        ? executedQtyStr.split('.')[1].replace(/0+$/, '').length 
        : 0;

    const fills = result.fills; // Detalhes da transação

    // Iterar sobre os fills para verificar a comissão
    for (const fill of fills) {
        const commission = parseFloat(fill.commission); // Comissão cobrada
        const commissionAsset = fill.commissionAsset;  // Moeda da comissão

        // Verificar se a comissão foi cobrada na mesma moeda comprada
        if (commissionAsset === result.symbol.replace('USDT', '')) {
            // Retornar a quantidade adquirida deduzida da comissão
            return parseFloat((executedQty - commission).toFixed(decimalPlaces));
        }
    }

    // Se nenhuma comissão foi na mesma moeda, retornar a quantidade executada
    return parseFloat(executedQty.toFixed(decimalPlaces));
}

module.exports = {
    runActionEvery30min,
    calcAmount,
    getInfo,
    updateAccsPositions,
    closePositions,
    getDecimalPlaces,
    calculateAcquiredAmount
}