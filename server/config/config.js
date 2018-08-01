


// Port
process.env.PORT = process.env.PORT || 3000;
//Enviroment
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//Database
let urlDB;
if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-admin:uno23456@ds259711.mlab.com:59711/cafe';
 }
process.env.URLDB = urlDB;
