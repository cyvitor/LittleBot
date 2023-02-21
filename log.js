const fs = require('fs');

function escreveLog(msg, file) {
    const dataHora = new Date().toLocaleString();
    const texto = `${dataHora} - ${msg}\n`;
    fs.appendFile(file, texto, err => {
        if (err) throw err;
    });
}

module.exports = escreveLog;