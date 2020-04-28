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
    let data, err;
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
    const date = '2020-04-26'
    const converstionRate = await getCurrencyRates(base, transaction["currency"], date);
    return {
        "createdAt": transaction["createdAt"], // Not sure about this date, it can be current timestamp because it's being converted right now
        "currency": base,
        "convertedAmount": (transaction["amount"] * converstionRate).toFixed(4),
        "checksum": transaction["checksum"]
    }
}

/**
 * This function does the following tasks
 * 1) Get N transactions from transaction endpoint.
 * 2) Process each transaction and compute amount according against base currency
 * 3) Make a list of all processed transacations
 */
async function getProcessedTransactions(n) {
    var transactions = []
    // n: number of transactions to get and process
    var i = 0;
    for (; i < n; i++) {
        const transaction = await getSingleTransaction();
        const processedTransaction = await processTransaction(transaction, "EUR");
        transactions.push(processedTransaction);
    }
    return transactions;
}

app.get('/process-transactions', async function(req, resp) {
    // Get 10 transactions to process
    const processedTransactions = await getProcessedTransactions(2);
    const url = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/process-transactions";
    let data, err;

    [err, data] = await to(axios.post(url, {"transactions": processedTransactions}));
    if (err) {
        console.error("ERROR: ", err);
        return;
    }

    console.log("Response: ", data.data);
    resp.status(200).send(data.data);
    return;
});

app.listen(port, () => console.log(`Listening @ port ${port}`));