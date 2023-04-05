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
    const { getAcc, getAllBdSymbols, updateSymbol, insertSymbol } = require('./execQuery');
    const acc = await getAcc(1);
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
        escreveLog ("END runActionEvery30min", log_file_task_sch);
        await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); // espera 30 minutos
    }
}


module.exports = {
    runActionEvery30min,
    calcAmount,
    getInfo
}