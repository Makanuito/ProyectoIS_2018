const express = require('express');
const app = express();
const arriendo = require('../models/arriendo');
const Usuario = require('../models/usuario');
const Grupo = require('../models/grupo');
const {verificaToken} = require('../middlewares/autenticacion');
const bcrypt = require('bcryptjs');

//Backend de grupos

app.get('/grupo',verificaToken,(req,res) => {  // Obtiene todos los grupos 
    let limite = req.query.limite || 0;
    Grupo.find({estado:true}, 'nombre descripcion img miembros arriendos')
        .sort('nombre')
        .populate('miembros','nombre nacionalidad email img')
        .populate('arriendos','nombre descripcion costo direccion img duenoArriendo')
        .limit(limite)
        .exec((err,grupos) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Grupo.count({estado:true}, (err,conteo) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                res.json({
                    ok:true,
                    grupos,
                    conteo
                })
            })
        })
 });
 app.get('/grupo/mis-grupos/:id', verificaToken, (req,res) =>{ // MANDAR MIEMBROS EN UN ARRAY
    let limite = req.query.limite || 0;
    let usuario = req.usuario;
    Grupo.find({miembros:usuario.id}, 'nombre descripcion img miembros arriendos')
        .limit(limite)
        .exec((err,grupos) => {
            if (err){
                ok:false,
                err
            }
            res.json({
                ok:true,
                grupos
                })
            })
});
app.post('/grupo', verificaToken, (req,res) => {   // Crear un grupo ESTA MALA MODIFICAR
    let usuario = req.usuario; 
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
    nombreUser = usuario.nombre;
    nombreImagen = `${nombreUser.replace(/ /g, "")}-img-${new Date().getMilliseconds()}.${extension}`
    img.mv(`./files/grupos/${nombreImagen}`, (err) => {
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
    body.miembros.push(usuario.id);
    let grupo = new Grupo ({
        nombre: body.nombre,
        admin: usuario.id,
        descripcion: body.descripcion,
        img: nombreImagen,
        miembros: body.miembros,  // Agregar usuario y dejarlo como array
    })
    grupo.save((err,grupoDB) => {
        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!grupoDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            grupo: grupoDB
        })
    })
})
app.put('/grupo/:id',verificaToken, (req,res) => { // Actualiza un grupo
    let id = req.params.id;
    let estado = false;
    let usuario = req.usuario;
    // Validación de usuario y grupo

    Grupo.find({miembros:usuario.id}, 'nombre descripcion img miembros arriendos',(err,gruposDB) => {
        if (err){
            ok:false,
            err
        }
        for(i=0;i<gruposDB;i++){
            if (gruposDB[i].admin == usuario.id){
                estado=true;
            }
        }
    });
    if(estado==true){
        // Carga de la imagen
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
        nombreImagen = `${id}-img-${new Date().getMilliseconds()}.${extension}`
        img.mv(`./files/usuarios/${nombreImagen}`, (err) => {
            if (err)
                return res.status(500).json({
                    ok:false,
                    err
                });
        });
        let body = _.pick['nombre','estado','descripcion','img','miembros','arriendos'];
        body.img = nombreImagen;
        ActualizarImagen(id,res,nombreImagen,'grupos');
        // Update de grupo
        grupo.findByIdAndUpdate(id,body,(err,grupoDB) => {
            if (err) {
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            if(!grupoDB){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            res.json({
                ok: true,
                grupo: grupoDB
            })
        });
    } else {
        return res.status(400).json({
            ok:false,
            err: {
                message: "Usted no pertenece al grupo que quiere modificar"
            }
        });
    }
});
app.delete('/grupo/delete/:id',verificaToken,(req,res)=> {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    }
    grupo.findByIdAndUpdate(id,cambiaEstado,{new:true},(err,grupoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if (!grupoBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Grupo no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            grupo: grupoDB
        });
    });
});

module.exports = app;

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
            console.log(usuarioDB.img);
            BorraImagen('usuarios',usuarioDB.img);
            usuarioDB.img = nombreImagen
            console.log(usuarioDB.img);
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