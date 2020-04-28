/** Entry point for node app **/

import axios from 'axios';
const express = require('express');

// Init App
const app = express();
const port = 3000;

function to(promise) {
    return promise.then(data => {
        return [null, data];
    }).catch(err => {
        return [err, null]
    });
}

/**
 * Call transactions endpoint and return transactions data
 */
async function getSingleTransaction() {
    const url = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction";
    let data, err;
    [err, data] = await to(axios.get(url));
    if (err) {
        console.error("ERROR: ", err);
        return;
    }
    return data.data;
};


/**
 * Get Rate of current against base and quote currency at a specific date using 'https://api.exchangeratesapi.io'
 * @param {Base currency} base 
 * @param {Quote currency} quote 
 * @param {Instance of date for conversion} date 
 */
async function getCurrencyRates(base, quote, date) {
    const url = `https://api.exchangeratesapi.io/${date}?base=${base}`
    [err, data] = await to(axios.get(url));
    if (err) {
        console.error("ERROR: ", err);
        return;
    }

    return data.data["rates"][quote];
}

/**
 * Process a single transaction and make it ready for the next endpoint
 * @param {Single transaction from the transactions url} transaction 
 * @param {Base currency of transaction} base
 */
async function processTransaction(transaction, base) {
    // Hardcoding the date for now, because it depends on the use case. We could also use date of the transaction.
    var date = '2020-04-26'
    const converstionRate = await getCurrencyRates(base, transaction["currency"], date);
    return {
        "createdAt": transaction["createdAt"], // Not sure about this date, it can be current timestamp because it's being converted right now
        "currency": base,
        "convertedAmount": transaction["amount"] * converstionRate,
        "checksum": transaction["checksum"]
    }
}

app.get('/get-transactions', async function(_req, resp) {
    var transactions = []
    // n: number of transactions to get and process
    var i = 0, n = 10;
    for (; i < n; i++) {
        const transaction = await getSingleTransaction();
        const processedTransaction = await processTransaction(transaction, "EUR");
        transactions.push(processTransaction);
    }
    console.log(transactions);
    return;
});

app.listen(port, () => console.log(`Listening @ port ${port}`));