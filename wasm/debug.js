var express = require('express')
var path = require('path')
var app = express()

const port = 8083;

console.log(__dirname);

app.get('/', (req, res)=>{
    res.send('For debug');
});

app.listen(port, ()=>{
    console.log(`Server is running at http://localhost:${port}`)
});

app.get('/wasm/:name', function (req, res, next) {
    console.log(path.join(__dirname, req.params.name));
    res.set({
        "Access-Control-Allow-Origin": "*", 
    }).sendFile(path.join(__dirname, req.params.name));
});
