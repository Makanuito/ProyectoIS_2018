
// Requires y carga de módulos
const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const Grupo = require('../models/grupo');
const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');
const _= require('underscore');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');


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
app.post('/Registro',(req, res) => { // Registra un usuario local y actualiza un usuario
    let body = req.body;
    if (!req.files){
        return res.status(400).json({
            ok:false,
            err: {
                message:"No se ha seleccionado ningún archivo"
            }
        })
    }
    let img = req.files.img;
    // Extensiones permitidas
    let extensionesValidas = ['png','jpg','gif','jpeg',]
    let nombreCortado = img.name.split('.')
    let extension = nombreCortado[nombreCortado.length-1];
    if ( extensionesValidas.indexOf(extension.toLowerCase()) < 0 ){
        return res.status(400).json({
            ok:false,
            extension,
            err: {
                message: `Las extensiones permitidas son ${extensionesValidas.join(',')}` 
            }
        })
    }
    nombreUser = body.nombre;
    nombreImagen = `${nombreUser.replace(/ /g, "")}-img-${new Date().getMilliseconds()}.${extension}`
    img.mv(`./files/usuarios/${nombreImagen}`, (err) => {
        if (err)
            return res.status(500).json({
                ok:false,
                err
            });
        // res.json({ Ver que hacer con esto
        //     ok:true,
        //     message: "Imagen subida correctamente"
        // })
    })
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        img: nombreImagen,
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
        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
});

app.put('/usuario/:id',[verificaToken], (req, res) => {   // Actualiza un usuario 
    let id = req.params.id;
    if (!req.files){
        return res.status(400).json({
            ok:false,
            err: {
                message:"No se ha seleccionado ningún archivo"
            }
        })
    }
    let img = req.files.img;
    // Extensiones permitidas
    let extensionesValidas = ['png','jpg','gif','jpeg',]
    let nombreCortado = img.name.split('.')
    let extension = nombreCortado[nombreCortado.length-1];
    if ( extensionesValidas.indexOf(extension.toLowerCase()) < 0 ){
        return res.status(400).json({
            ok:false,
            extension,
            err: {
                message: `Las extensiones permitidas son ${extensionesValidas.join(',')}` 
            }
        })
    }
    let body = _.pick(req.body,['nombre','email','nacionalidad','ocupacion','genero','telefono','grupos','arriendos']); // Hay que definir como cambiar la puntuación de un usuario
    nombreUser = body.nombre;
    nombreImagen = `${nombreUser.replace(/ /g, "")}-img-${new Date().getMilliseconds()}.${extension}`
    img.mv(`./files/usuarios/${nombreImagen}`, (err) => {
        if (err)
            return res.status(500).json({
                ok:false,
                err
            });
        // res.json({ Ver como dejar esto...............
        //     ok:true,
        //     message: "Imagen subida correctamente"
        // })
    })
    ActualizarImagen(id,res,nombreImagen,'usuarios');
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
function ActualizarImagen(id,res,nombreImagen,tipo){
    if (tipo==='usuarios'){ // Es un usuario
        Usuario.findById(id,(err,usuarioDB) => {
            if (err) {
                BorraImagen('usuarios',nombreImagen);
                return res.json(500).json({
                    ok: false,
                    err
                })
            }
            if(!usuarioDB){
                BorraImagen('usuarios',nombreImagen);
                return res.json(400).json({
                    ok: false,
                    err: {
                        message: "El usuario no existe"
                    }
                })
            }
            BorraImagen('usuarios',usuarioDB.img);
            usuarioDB.img = nombreImagen
            usuarioDB.save((err,usuarioGuardado) =>{
                return 1;
            })
        })
    }
    if (tipo==='grupos'){  // Es un grupo
        Grupo.findById(id,(err,grupoDB) =>{
            if (err) {
                BorraImagen('grupos',nombreImagen);
                return res.json(500).json({
                    ok: false,
                    err
                })
            }
            if(!grupoDB){
                BorraImagen('grupos',nombreImagen);
                return res.json(400).json({
                    ok: false,
                    err: {
                        message: "El grupo no existe"
                    }
                })
            }
            BorraImagen('grupos',grupoDB.img);
            grupoDB.img = nombreImagen;
            Grupo.save((err,grupoGuardado) =>{
                res.json({
                    ok:true,
                    grupo: grupoDB
                })
            })
        })
    }
}

function BorraImagen(tipo,nombreImagen){
    let pathImagen = path.resolve(__dirname,`../../files/${tipo}/${nombreImagen}`)
        if (fs.existsSync(pathImagen)){
            fs.unlinkSync(pathImagen)
        }
}


module.exports = app;