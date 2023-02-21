const mysql = require('mysql2/promise');

async function execQuery(query) {
  const connection = await mysql.createConnection({
    host: '172.16.55.200',
    user: 'vitor',
    password: 'cyberdainy',
    database: 'littlebot'
  });

  const [rows] = await connection.execute(query);

  connection.end();

  return rows;
}

module.exports = execQuery;