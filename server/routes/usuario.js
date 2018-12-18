
// Requires y carga de módulos
const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');
const _= require('underscore');

app.get('/usuario',verificaToken,(req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 0;
    desde = Number(desde);
    limite = Number (limite);
    Usuario.find({estado:true},'nombre email role estado google img')
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

app.post('/usuario',[verificaToken,verificaAdmin_Role] ,(req, res) => {
    let body = req.body;
    
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        role: body.role
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
  })

app.put('/usuario/:id',[verificaToken,verificaAdmin_Role ], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body,['nombre','email','img','role','estado']);
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
})
  
app.delete('/usuario/:id',[verificaToken,verificaAdmin_Role] , (req, res) => {
    
    let id = req.params.id;
    let cambiaEstado =  {
        estado: false
    }
    let body = _.pick(req.body,['estado']);
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