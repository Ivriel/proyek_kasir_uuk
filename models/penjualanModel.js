const mongoose = require("mongoose")

const penjualanSchema = new mongoose.Schema({
    TanggalPenjualan: {
        type:Date,
        required:true
    },
    TotalHarga: {
        type:Number,
        required:true
    },
    PelangganID: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Pelanggan",
        required:true
    }
})

module.exports = mongoose.model("Penjualan",penjualanSchema)