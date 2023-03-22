require('dotenv').config();
const { clearSymbols, insertSymbol, getOrdens2 } = require('./execQuery');
const { futuresExchangeInfo, accFuturesDepositHistory, accFuturesBalance, accSpotDepositHistory } = require("./binance");
/*
function calcAmount(investment, percentage, currentPrice, decimalPlaces) {
    const result = (investment * percentage) / 100;
    const amount = result / currentPrice;
    const fator = Math.pow(10, decimalPlaces);
    return Math.floor(amount * fator) / fator;
}
console.log(calcAmount(1000, 15, 20148, 8));
*/

const api = 'f7c4b16dc62b9b65b171e1bb3c9f18f78d0f46dcca6bae7016dfc576df373795';
const secert = '77a85499a1f93fd06018541fd1fc2ee0caa6c3037748577676a3963e3a396df0';

async function getInfo() {
    const info = await futuresExchangeInfo(api, secert);
    clearSymbols();
    info.symbols.forEach((symbolInfo) => {
        
        const { symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset } = symbolInfo;
        console.log(`${symbol}, ${status}`);
        insertSymbol(symbol, quantityPrecision, baseAssetPrecision, quotePrecision, status, baseAsset, quoteAsset);
    });
}

getInfo();
/*
setInterval(getInfo, 15000);*/
/*
async function testSelect(api, secert){
    console.log(await accSpotDepositHistory(api, secert));
}
testSelect(api, secert);
console.log(process.env.TEST);*/