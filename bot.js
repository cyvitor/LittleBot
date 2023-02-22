const escreveLog = require('./log');
const execQuery = require('./execQuery');
const { openFutureOrder } = require('./openFutureOrder');
const log_file = "C:\\JS\\LittleBot\\log.txt";
escreveLog('Init', log_file);

// executar consulta a cada 5 segundos
setInterval(async () => {
  try {
    escreveLog('Exec', log_file);

    const ordens = await getOrdens();
    //console.log(ordens);

    ordens.forEach(async (orden) => {
      const { id, symbol, side, type, quantity, price, stopPrice, testnet, status } = orden;
      escreveLog(`Orden: ID: ${id}, Status: ${status}`, log_file);
      //const r = await setOrderStateDone(id);

      const accs = await getAccs();

      accs.forEach(async (acc) => {
        const { accid, apiKey, apiSecret } = acc;
        escreveLog(`ACC: ID: ${accid}, apiKey: ${apiKey}`, log_file);

        //ENVIA ORDEM
        //

      })

    })

  } catch (err) {
    console.error(err);
  }
}, 5000);


async function getOrdens() {
  const query = 'SELECT * FROM ordens where status = 0';
  const resultado = await execQuery(query);
  return resultado;
}

async function setOrderStateDone(id) {
  const query = 'UPDATE ordens SET status = 1 WHERE id = ' + id;
  const resultado = await execQuery(query);
  return resultado;
}

async function getAccs() {
  const query = 'SELECT * FROM accs where status = 1';
  const resultado = await execQuery(query);
  return resultado;
}