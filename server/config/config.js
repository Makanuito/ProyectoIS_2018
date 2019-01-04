


// Port
process.env.PORT = process.env.PORT || 3000;
//Enviroment
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//Vencimiento del token
// 60s
// 60m
// 24h
// 30d
process.env.CADUCIDAD_TOKEN = '48h'
//SEED de login
process.env.SEED_LOGIN = process.env.SEED_LOGIN || 'este-es-el-seed-desarrollo';



//Database
let urlDB;
if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/ProyectoIS';
} else {
    urlDB = process.env.MONGO_URI;
 }


process.env.URLDB = urlDB;


// Google client ID

process.env.CLIENT_ID = process.env.CLIENT_ID || '881237089729-vfkd60ovftgdunot30gcndj854n4be9s.apps.googleusercontent.com';