const {  saveAccOrder, saveMsg } = require('./execQuery');

const accid = 20;
const id = 30;
const orderId = 12345678
const status = 'NEW';
const origQty = 1;
const executedQty = 2;
const type = 'MARKET';
const side = 'BUY';
const msg = 'MSG TEste';
const msg_code = '2010';

//saveAccOrder(accid, id, orderId, status, origQty, executedQty, type, side);

//saveMsg(accid, msg, msg_code);