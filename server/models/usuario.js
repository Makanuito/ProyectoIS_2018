
const mongoose = require ('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true,'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required : [true,'El correo es necesario']
    },
    password: {
        type: String,
        required: [true,'La contraseña es obligatoria']
    },
    img: {
        type: String,
    },
    nacionalidad: {
        type: String,
        default: "No registra"
    },
    ocupacion: {
        type: String,
        default: "No registra"
    },
    genero: {
        type: String,
        default: "No registra"
    },
    puntuacion:{
        type: Number
    },
    telefono:{
        type: String,
        default: "No registra"
    },
    estado: {
        type: Boolean, 
        default: true
    }, //boolean
    google: {
        type: Boolean,
        default: false
    }, //boolean
    facebook: {
        type: Boolean,
        default: false
    },
    grupos: {
        type: Array
    },
    arriendos: {
        type: Array
    }
});
usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

usuarioSchema.plugin(uniqueValidator,{
    message: '{PATH} debe de ser único'
})

module.exports = mongoose.model('Usuario',usuarioSchema);