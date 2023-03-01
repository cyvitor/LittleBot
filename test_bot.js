require('dotenv').config();
const { getOrdens, getOrdersProgrammed } = require('./execQuery');

getOrdens().then(ordens => {
    //console.log(ordens);

});

getOrdersProgrammed().then(ordens2 =>{
   // console.log(ordens2);
});


async function teste(){
    console.log("ordens");
    const ordens = await getOrdersProgrammed();
    console.log(ordens);
    ordens.forEach((orden) =>{
        const {id, symbol, side, type, quantity, price } = orden;
        console.log(`ID: ${id}, Symbol: ${symbol}, q: ${quantity}`);
    })    
};

teste();