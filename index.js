/** Entry point for node app **/

import axios from 'axios';
import express from express;

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

app.get('/get-transactions', async function(_req, resp) {
    const url = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction";
    let data, err;
    [err, data] = await to(axios.get(url));
    if (err) {
        console.error("ERROR: ", err);
        return;
    }
    resp.status(200).send(data.data);
    return;
});

app.listen(port, () => console.log(`Listening @ port ${port}`));