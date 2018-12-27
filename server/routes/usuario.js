
// Requires y carga de módulos
const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');
const _= require('underscore');

app.get('/usuario',verificaToken,(req, res) => { // Obtiene usuarios

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 0;
    desde = Number(desde);
    limite = Number (limite);
    Usuario.find({estado:true},'nombre email img nacionalidad ocupacion genero puntuacion telefono google facebook grupos arriendos')
        .skip(desde)
        .limit(limite)
        .exec((err,usuarios) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Usuario.count({estado: true}, (err,conteo) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })   //recibe una condición y un callback
        });
  });

app.post('/Registro',(req, res) => { // Registra un usuario local
    let body = req.body; 
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        nacionalidad: body.nacionalidad,
        ocupacion: body.ocupacion,
        genero: body.genero,
        telefono: body.telefono,
    });
    usuario.save((err,usuarioDB) =>{
        if (err){
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
});

app.put('/usuario/:id',[verificaToken,verificaAdmin_Role], (req, res) => {   // Actualiza un usuario 
    let id = req.params.id;
    let body = _.pick(req.body,['nombre','email','img','nacionalidad','ocupacion','genero','telefono','grupos','arriendos']); // Hay que definir como cambiar la puntuación de un usuario
    Usuario.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
          });
        })
}) // HASTA AQUI VOY 26/12/2018
  
app.delete('/usuario/:id',[verificaToken,verificaAdmin_Role] , (req, res) => {
    
    let id = req.params.id;
    let cambiaEstado =  {
        estado: false
    }
    Usuario.findByIdAndUpdate(id,cambiaEstado,{new:true},(err,usuarioDB) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });
});

// app.delete('/usuario/:id', function (req, res) {
    
//     let id = req.params.id;
//     Usuario.findByIdAndRemove(id,(err,usuarioDB) => {
//         if (err) {
//             return res.status(400).json({
//                 ok:false,
//                 err
//             });
//         }
//         if (!usuarioDB){
//             return res.status(400).json({
//                 ok:false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }
//         res.json({
//             ok: true ,
//             usuario: usuarioDB
//         });
//     });

//   })


module.exports = app;