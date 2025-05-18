const mongoose = require("mongoose")

const pelangganSchema = new mongoose.Schema({
    NamaPelanggan: {
        type:String,
        required:true
    },
    Alamat: {
        type:String,
        required:true
    },
    NomorTelepon: {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Pelanggan',pelangganSchema)