const express = require('express');
const process = require('process');

const app = express();
app.listen(1111, () => {
    console.log(1111)
})
app.get('/', (req, res) => {
    console.log(`Process pid ${process.pid}`);
    res.send('1111:' + process.pid)
})

const app2 = express();
app2.listen(2222, () => {
    console.log(2222)
})

app2.get('/', (req, res) => {
    console.log(`Process pid ${process.pid}`);
    res.send('2222:' + process.pid)
})