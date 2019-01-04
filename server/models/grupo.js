const mongoose = require ('mongoose');
let Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let grupoSchema = new Schema({
    nombre: {
        type: String,
        required: "El nombre del grupo es requerido"
    },
    descripcion: {
        type: String,
        default: "No contiene descripción"
    },
    img: {
        type: String,
        default: "Link de una imagen que ponga 'No imagen'"
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    miembros: [{ // array de id_usuarios con atributo admin al dueño del grupo
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    arriendos: [{ // array de id_arriendo con id_dueño de arriendo
        type: [Schema.Types.ObjectId],
        ref: 'arriendo'
    }],
    estado:{
        type: Boolean,
        default: true
    } 
});

grupoSchema.plugin(uniqueValidator,{
    message: '{PATH} debe de ser único'
})

module.exports = mongoose.model('grupo',grupoSchema);