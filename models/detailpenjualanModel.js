const mongoose = require("mongoose")

const detailpenjualanSchema = new mongoose.Schema({
    PenjualanID:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Penjualan"
    },
    ProdukID: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Produk"
    },
    JumlahProduk: {
        type:Number,
        required:true
    },
    Subtotal: {
        type:Number, 
        required:true
    }
})

module.exports = mongoose.model("DetailPenjualan",detailpenjualanSchema)