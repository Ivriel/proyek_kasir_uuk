const mongoose = require("mongoose")

const produkSchema = new mongoose.Schema({
    Gambar: {
        type:String,
        required:true
    },
    NamaProduk: {
        type:String,
        required:true
    },
    Harga: {
        type:Number,
        required:true
    },
    Stok: {
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('Produk',produkSchema)