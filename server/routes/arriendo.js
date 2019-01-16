const express = require('express');
const app = express();
const arriendo = require('../models/arriendo');
const Usuario = require('../models/usuario');
const {verificaToken} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');
const _= require('underscore');


// Backed de buscar arriendos 
app.get('/arriendo',verificaToken,(req,res) => { // Falta el get de listar arriendos propios
    let limite = req.query.limite || 0;
    limite = Number (limite);
    arriendo.find({estado: true},'nombre descripcion direccion costo img grupos duenoArriendo')
        .limit(limite)
        .populate('grupos','nombre img descripcion miembros')
        .populate('duenoArriendo','nombre email puntuacion')
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
app.get('/arriendo/mis-arriendos/', verificaToken, (req,res) => { // Busca arriendos por idDueño PUEDO ACTUALILZAR Y HACER UNA QUERY A USUARIO.GRUPOS
    usuario = req.usuario;
    let limite = req.query.limite || 0;
    limite = Number (limite);
    arriendo.find({estado: true, duenoArriendo: usuario._id},'nombre descripcion direccion costo img grupos')
        .sort('nombre')
        .populate('arriendos')
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
})

app.post('/arriendo/',verificaToken,(req,res) =>{  // Crear arriendo 
    let body = req.body;
    let usuario = req.usuario;
    let extensionesValidas = ['png','jpg','gif','jpeg',]
    if (!req.files){
        return res.status(400).json({
            ok:false,
            err: {
                message:"No se ha seleccionado ningún archivo"
            }
        })
    }
    let img = [];
    let extension =[];
    for(i=0;i<req.files.file.length;i++){
        img[i] = req.files.file[i]
        extension[i] = img[i].name.split('.')
    }
    
    for (i=0;i<req.files.file.length;i++){
        let indice = extension[i][1].toLowerCase();
        if ((extensionesValidas.indexOf(indice)) < 0){
            return res.status(400).json({
                ok:false,
                extension,
                err: {
                    message: `Uno de los archivos subidos se encuentra entre las extensiones permitidas ${extensionesValidas}`
                }
            })
        }
    }
    nombreUser = usuario.nombre;
    for (i=0;i<=extension.length-1;i++){
        nombreImagen = `${nombreUser.replace(/ /g, "")}-img-${i}-${new Date().getMilliseconds()}.${extension[i][1]}`
        img[i].mv(`./files/arriendos/${nombreImagen}`, (err) => {
        if (err)
            return res.status(500).json({
                ok:false,
                err
            });
        })
    }
    let Arriendo = new arriendo({
        nombre: body.nombre,
        descripcion: body.descripcion,
        direccion: body.direccion,
        costo: body.costo,
        img: extension,
        duenoArriendo: usuario._id
    });
    Arriendo.save((err,arriendoDB) =>{
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!arriendoDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        Usuario.findById(usuario._id,(err,usuarioDB) => {
            usuarioDB.arriendos.push(arriendoDB._id)
            usuarioDB.save((err,usuarioDB) => {
                if ( err) {
                    return res.status(400).json({
                        ok:false,
                        err
                    })
                }
            })
        })
        res.json({
            ok: true,
            arriendo: arriendoDB
        });
    });
});

app.put('/arriendo/:id',verificaToken,(req,res) =>{ // Actualiza un arriendo
    usuario = req.usuario;
    let img = [];
    let extension =[];
    for(i=0;i<req.files.file.length;i++){
        img[i] = req.files.file[i]
        extension[i] = img[i].name.split('.')
    }
    for (i=0;i<req.files.file.length;i++){
        let indice = extension[i][1].toLowerCase();
        if ((extensionesValidas.indexOf(indice)) < 0){
            return res.status(400).json({
                ok:false,
                extension,
                err: {
                    message: `Uno de los archivos subidos se encuentra entre las extensiones permitidas ${extensionesValidas}`
                }
            })
        }
    }
    nombreUser = usuario.nombre;
    for (i=0;i<=extension.length-1;i++){
        nombreImagen = `${nombreUser.replace(/ /g, "")}-img-${i}-${new Date().getMilliseconds()}.${extension[i][1]}`
        img[i].mv(`./files/arriendos/${nombreImagen}`, (err) => {
        if (err)
            return res.status(500).json({
                ok:false,
                err
            });
        })
    }
    // manejar el arreglo
    let body = _.pick(req.body,['nombre','estado','descripcion','direccion','costo','grupos',]);
    body.img = extension;
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