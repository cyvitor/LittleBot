require('dotenv').config();
const { accFuturesBalance, getfuturesIncome, getOrderStatus, accSpotBalance } = require('./binance');
const { getAccs, updateBalance, updateAccInvestiment, updateOrder, getNewOrders, updateBalanceSpot, updateAccSpotInvestiment } = require('./execQuery');
const { escreveLog, escreveLogJson } = require('./log');
const log_file = process.env.LOG_ACCS;

async function updateAccsbalances() {
    try {
        escreveLog("UpdateAccs", log_file);
        let balances;
        const accs = await getAccs();
        const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment } = acc;
            //escreveLog(`ACCID: ${accid}, invest: ${investment}, apiKey: ${apiKey}`, log_file);
            try {
                balances = await accFuturesBalance(apiKey, apiSecret);
                //deposits = await getfuturesIncome(apiKey, apiSecret);
                if (balances.code && balances.msg) {
                    escreveLogJson(`ACCID: ${accid} ERROR`, balances, log_file);
                } else {
                    await Promise.all(balances.map(async (item) => {
                        const changed = await updateBalance(accid, item.asset, item.balance, item.availableBalance);
                        if (changed) {
                            escreveLog(`changed ACCID: ${accid}, Asset: ${item.asset}, Balance: ${item.balance}, Available Balance: ${item.availableBalance}`, log_file);
                        }
                        if (item.asset === "USDT" && investment == 0) {
                            await updateAccInvestiment(accid, item.availableBalance);
                        }
                    }));
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

async function updateOrderStatus() {
    const ordens = await getNewOrders();
    const promises = ordens.map(async (orden) => {
        const { accs_orders_id, orderId, symbol, apiKey, apiSecret, accid } = orden;
        console.log(`Check ${accs_orders_id} ${orderId}`);
        (async () => {
            try {
                result = await getOrderStatus(apiKey, apiSecret, symbol, orderId);
                console.log(result);
                escreveLogJson(`ACCID: ${accs_orders_id}, OrdemID: ${orderId}`, result, log_file);
                if (result['orderId']) {
                    updateOrder(accs_orders_id, result['status'], result['executedQty'], result['avgPrice']);
                } else {
                    saveMsg(accid, result['msg'], result['code']);
                }
            } catch (error) {
                escreveLogJson(`ACCID: ${accid}, OrdemID: ${orderId}, ERROR:`, error, log_file);
            }

        })();
    });
    await Promise.all(promises);
}
//updateAccsbalances();
//setInterval(updateAccsbalances, process.env.SETINTERVAL_UPDATEACC);
async function updateAccsbalances2() {
    try {
        escreveLog("UpdateAccs", log_file);
        let balances;
        const accs = await getAccs();
        const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment } = acc;
            escreveLog(`ACCID: ${accid}, invest: ${investment}, apiKey: ${apiKey}`, log_file);
            try {
                balances = await accFuturesBalance(apiKey, apiSecret);
                //deposits = await getfuturesIncome(apiKey, apiSecret);
                if (balances.code && balances.msg) {
                    escreveLogJson(`ACCID: ${accid} ERROR`, balances, log_file);
                } else {
                    await Promise.all(balances.map(async (item) => {
                        const changed = await updateBalance(accid, item.asset, item.balance, item.availableBalance);
                        if (changed) {
                            escreveLog(`changed ACCID: ${accid}, Asset: ${item.asset}, Balance: ${item.balance}, Available Balance: ${item.availableBalance}`, log_file);
                        }
                        if (item.asset === "USDT" && investment == 0) {
                            await updateAccInvestiment(accid, item.balance);
                        }
                        if (item.asset === "USDT" &&  item.balance > investment) {
                            await updateAccInvestiment(accid, item.balance);
                        }
                    }));
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

async function updateAccsbalancesSpot() {
    try {
        escreveLog("UpdateAccs", log_file);
        let balances;
        const accs = await getAccs();
        const promises = accs.map(async (acc) => {
            const { accid, apiKey, apiSecret, investment_spot } = acc;
            escreveLog(`ACCID: ${accid}, invest: ${investment_spot}, apiKey: ${apiKey}`, log_file);

            try {
                balances = await accSpotBalance(apiKey, apiSecret);
                if (balances.code && balances.msg) {
                    escreveLogJson(`ACCID: ${accid} ERROR`, balances, log_file);
                } else {
                    //console.log(balances);
                    
                    await Promise.all(balances.map(async (item) => {
                        const changed = await updateBalanceSpot(accid, item.asset, item.free, item.locked);
                        if (changed) {
                            escreveLog(`changed ACCID: ${accid}, Asset: ${item.asset}, Free: ${item.free}, Locked: ${item.locked}`, log_file);
                        }
                        if (item.asset === "USDT" && investment_spot == 0) {
                            await updateAccSpotInvestiment(accid, item.free);
                        }
                        if (item.asset === "USDT" &&  item.free > investment_spot) {
                            await updateAccSpotInvestiment(accid, item.free);
                        }
                    }));
                    
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

module.exports = {
    updateAccsbalances,
    updateOrderStatus,
    updateAccsbalances2,
    updateAccsbalancesSpot
};