const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/img/:tipo/:img', (req,res)=>{
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImg = path.resolve(__dirname,`../../files/${tipo}/${img}`)
    if(fs.existsSync (pathImg)){
        res.sendFile(pathImg);
    }else {
        let noImagePath = path.resolve(__dirname,'../no-image.jpg');
        res.sendFile(noImagePath);
    }
});














module.exports = app;