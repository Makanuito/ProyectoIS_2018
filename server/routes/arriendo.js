const express = require('express');
const app = express();
const arriendo = require('../models/arriendo');
const Usuario = require('../models/usuario');

const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');
const _= require('underscore');
// Backed de buscar arriendos 
app.get('/arriendo',verificaToken,(req,res) => { // Falta el get de listar arriendos propios

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 0;
    desde = Number(desde);
    limite = Number (limite);
    arriendo.find({estado: true},'nombre descripcion direccion costo img grupos duenoArriendo')
        .limit(limite)
        .exec((err,arriendos) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            arriendo.count({estado: true}, (err,conteo) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    arriendos,
                    conteo
                })
            }); 
        });
});
app.get('/arriendo:id',verificaToken,(req,res) =>{ // Obtener un arriendo por id
    let id = req.params.id;
    arriendo.findOne({estado:true, _id:id},(err,arriendoDB) => {
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
    });
    return arriendoDB;
});
app.get('/arriendo/mis-arriendos/:id', verificaToken, (req,res) => {
    idDueno = req.usuario; 
    arriendo.find({estado: true, duenoArriendo: usuario},'nombre descripcion direccion costo img grupos')
        .limit(limite)
        .exec((err,arriendos) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            arriendo.count({estado: true}, (err,conteo) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                Arriendos = {arriendos,conteo}
                return Arriendos;
            }); 
        });
})

app.post('/arriendo',verificaToken,(req,res) =>{  // Crear arriendo 
    let body = req.body;
    let usuario = req.usuario;
    Usuario.findOne({estado:true, email:usuario.email}, (err,usuarioDB) =>{
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        let dueno = {
            id: usuarioDB._id,
            nombre: usuarioDB.nombre,
            puntuacion: usuarioDB.puntuacion
        };
    });
    let arriendo = new arriendo({
        nombre: body.nombre,
        descripcion: body.descripcion,
        direccion: body.direccion,
        costo: body.costo,
        img: body.img,
        duenoArriendo: {
            id: dueno.id,
            nombre: dueno.nombre,
            puntuacion: dueno.puntuacion
        }
    });
    
    arriendo.save((err,arriendoDB) =>{
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            arriendo: arriendoDB
        });
    });
});

app.put('/arriendo/:id',verificaToken,(req,res) =>{ // Actualiza un arriendo
    let body = _.pick(req.body,['nombre','estado','descripcion','direccion','costo','img','grupos',]);
    let usuario = req.usuario;
    idArriendo = req.params.id;
    arriendo.findByIdAndUpdate(idArriendo,body,{new:true,runValidators:true},(err,arriendoDB) => {
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok: true,
            arriendo: arriendoDB
        });
    });
});
app.delete('/arriendo/delete/:id',verificaToken,(req,res) => {
    idArriendo = req.params.id;
    let cambiaEstado = {
        estado: false
    };
    arriendo.findByIdAndUpdate(idArriendo,cambiaEstado,{new:true} ,(err,usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if (!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            arriendo: arriendoDB
        });
    });
})
module.exports = app;