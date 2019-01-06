const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const app = express();
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const cookieParser = require('cookie-parser');


app.post('/login',(req,res) => {
    let body = req.body;
    Usuario.findOne({email:body.email}, (err,usuarioDB) => {

        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                err :{
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password,usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err :{
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB
        },process.env.SEED_LOGIN,{expiresIn:process.env.CADUCIDAD_TOKEN});
        res.cookie('token',token);
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});
//Configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
         email: payload.email,
         img: payload.picture,
         google: true
    };
    
}
app.post('/google', async (req,res) => {
    
     let token2 = req.body.idtoken;
    let googleUser = await verify(token2)
        .catch(e =>{
            return res.status(403).json({
                ok: false,
                err: e
            })
        });
    
    Usuario.findOne({email:googleUser.email}, (err,usuarioDB) =>{
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB){ // Si existe usuario en db
            let token = jwt.sign({
                usuario: usuarioDB
            },process.env.SEED_LOGIN,{expiresIn:process.env.CADUCIDAD_TOKEN});
            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        } else {
            //Si usuario no existe en db 
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // Cambiar esto
            usuario.save((err,usuarioDB) =>{
                if (err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED_LOGIN,{expiresIn:process.env.CADUCIDAD_TOKEN});
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            })
        }
    });
});

app.post('/facebook', async (req,res) => {
    let fbUser = req.body;
    Usuario.findOne({email:fbUser.userID}, (err,usuarioDB) =>{
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (usuarioDB){
            let token = jwt.sign({
                usuario: usuarioDB
            },process.env.SEED_LOGIN,{expiresIn:process.env.CADUCIDAD_TOKEN});
            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        }
        else{
            let usuario = new Usuario();
            // usuario.idFacebook = fbUser.userID;
            usuario.nombre = fbUser.name;
            usuario.email = fbUser.userID;
            usuario.facebook = true;
            usuario.password = ':9'; //cambiar esto
            usuario.img = fbUser.img;
            usuario.save((err,usuarioDB) =>{
                if (err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED_LOGIN,{expiresIn:process.env.CADUCIDAD_TOKEN});
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    })
});



module.exports = app;