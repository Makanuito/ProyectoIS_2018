
const express = require('express');
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser')
const path = require ('path');
const hbs = require('hbs');
require('./config/config');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());
// Configuración handlebars (HBS)

app.set('views', path.join(__dirname, './views'));
hbs.registerPartials(__dirname + './parciales');
app.set('view engine', 'hbs');
app.use(require('./routes/hbs'));
// Configuración global de rutas
app.use(require('./routes/index'));
//habilitar el public
public = path.resolve(__dirname, '../public');
app.use(express.static(public));

mongoose.connect(process.env.URLDB, (err,res) =>{

  if (err) throw err;
  console.log('Base de datos ONLINE');

});

app.listen(process.env.PORT, () => {
  console.log(`Escuchando puerto : `,process.env.PORT);
})
