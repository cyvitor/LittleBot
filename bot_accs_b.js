require('dotenv').config();
const { accFuturesBalance } = require('./binance');
const { getAccs, updateBalance, updateAccInvestiment } = require('./execQuery');
const { escreveLog, escreveLogJson } = require('./log');
const log_file = process.env.LOG_ACCS;

async function updateAccsbalances() {
    try {
        let balances;
        const accs = await getAccs();
        const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment } = acc;
            //escreveLog(`ACCID: ${accid}, invest: ${investment}, apiKey: ${apiKey}`, log_file);
            try {
                balances = await accFuturesBalance(apiKey, apiSecret);
                if (balances.code && balances.msg) {
                    escreveLogJson(`ACCID: ${accid} ERROR`, balances, log_file);
                } else {
                    balances.forEach((item) => {
                        escreveLog(`ACCID: ${accid}, Asset: ${item.asset}, Balance: ${item.balance}, Available Balance: ${item.availableBalance}`, log_file);
                        updateBalance(accid, item.asset, item.balance, item.availableBalance);
                        if (item.asset === "USDT" && investment == 0) {
                            updateAccInvestiment(accid, item.availableBalance);
                        }
                    });
                }
            } catch (error) {
                escreveLogJson(`ACCID: ${accid}, ERROR:`, error, log_file);
            }
        });
        await Promise.all(promises);
    } catch (err) {
        console.error(err);
    }
}

//updateAccsbalances();
//setInterval(updateAccsbalances, process.env.SETINTERVAL_UPDATEACC);

module.exports = { updateAccsbalances };