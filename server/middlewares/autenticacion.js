const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');

const app = express();


// Verificar token
let verificaToken = (req,res,next) => {    
    // let token = req.get('token');
    token = req.cookies.token;
    jwt.verify(token,process.env.SEED_LOGIN, (err,decoded) =>{
        if(err){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next()
    });
};
// Verifica Admin-Role
let verificaAdmin_Role = (req,res,next) => {

    let usuario = req.usuario;
    if (usuario.role != 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: `Rol '${usuario.role}' no válido, se necesita ser administrador`
            }
        })
    }
    next();   
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
};