const Produk = require("../models/produkModel")

const produkController = {
    getDaftarProduk: async(req,res) => {
        try {
            const produkList = await Produk.find()
            res.render('daftarProduk',{produkList})
        } catch (error) {
            console.error("Error fetching products",error)
            res.status(500).send("Internal Server Error")
        }
    }
}

module.exports = produkController