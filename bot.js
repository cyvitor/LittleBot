const escreveLog = require('./log');
const execQuery = require('./execQuery');
const { openFutureOrder } = require('./openFutureOrder');
const log_file = "C:\\JS\\LittleBot\\log.txt";
console.log("Init");

// executar consulta a cada 5 segundos
setInterval(async () => {
  try {
    console.log("Exec");
    escreveLog('Exec', log_file);

    const ordens = await getOrdens();
    console.log(ordens);

    ordens.forEach((orden) => {
      const { id, symbol, side, type, quantity, price, stopPrice, status } = orden;
      console.log(`Orden: ID: ${id}, Status: ${status}`);
    })

  } catch (err) {
    console.error(err);
  }
}, 5000);


async function getOrdens() {
  const query = 'SELECT * FROM ordens';
  const resultado = await execQuery(query);
  return resultado;
}