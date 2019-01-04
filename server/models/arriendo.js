const mongoose = require ('mongoose');
let Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let arriendoSchema = new Schema({
    nombre: {
        type: String,
        required: "Nombre de arriendo requerido"
    },
    estado: {
        type: Boolean,
        default: true
    },
    descripcion: {
        type: String,
        default: "No contiene descripción"
    },
    direccion: {
        type: String,
        required: "Dirección del arriendo requerida"
    },
    costo: {
        type: Number,
        required: "Costo del arriendo requerido"
    },
    img: [{
        type: String,
        default: ['No registra imagenes']
    }],
    grupos: {
        type: Schema.Types.ObjectId,
        ref: 'grupo'
    },
    duenoArriendo: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

arriendoSchema.plugin(uniqueValidator,{
    message: '{PATH} debe de ser único'
})

module.exports = mongoose.model('arriendo',arriendoSchema);