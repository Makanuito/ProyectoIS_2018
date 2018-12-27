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
    img: {
        type: String,
        default: "Link de una imagen que ponga 'No imagen'"
    },
    grupos: {
        type: Array,
        default: "Sin grupos asociados"
    },
    duenoArriendo: {
        type: Array
    }
});

arriendoSchema.plugin(uniqueValidator,{
    message: '{PATH} debe de ser único'
})

module.exports = mongoose.model('arriendo',arriendoSchema);