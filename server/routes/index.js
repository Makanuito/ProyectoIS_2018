const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./arriendo'));
app.use(require('./grupo'));
app.use(require('./hbs'));
app.use(require('./imagenes'));
module.exports = app;