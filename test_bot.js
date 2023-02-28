const { getOrdens } = require('./execQuery');

getOrdens().then(ordens => {
    console.log(ordens);
    let r = ordens[0]["params"];

    if(ordens[0]["params"]){
        const params = JSON.parse(r);
        console.log(params.closeOrderID);
    }
});