const Produk = require("../models/produkModel")
const path = require('path')
const fs = require('fs')

const produkController = {
    getDaftarProduk: async(req,res) => {
        try {
            const produkList = await Produk.find()
            res.render('daftarProduk',{produkList})
        } catch (error) {
            console.error("Error fetching products:",error)
            res.status(500).send("Internal Server Error")
        }
    },
    getTambahProduk: async(req,res) =>{
        try {
            res.render('formTambahProduk')
        } catch (error) {
            console.error("Error fetching products:",error)
            res.status(500).send("Internal Server Error")
        }
    },
    tambahProduk: async(req,res)=> {
        try {
           const {namaproduk,harga,stok} = req.body
           const gambarPath = req.file ? req.file.filename : null
           const produk = new Produk({
            Gambar:gambarPath,
            NamaProduk:namaproduk,
            Harga:harga,
            Stok:stok
           })
           await produk.save()
           res.redirect('/produk')
        } catch (error) {
            console.error("Error adding book:",error)
            res.status(500).send("Internal Server Error")
        }
    },
    getEditProduk:async(req,res)=> {
        try {
            const produkId = req.params.id
            const produk = await Produk.findById(produkId)
            res.render('formEditProduk',{produk})
        } catch (error) {
            console.error("Error fetching products: ",error)
            res.status(500).send("Internal Server Error")
        }
    },
    editProduk:async(req,res)=> {
        try {
            const produkId = req.params.id
            const {namaproduk,harga,stok} = req.body
            const gambarPath = req.file? req.file.filename : null

            // cari produknya berdasarkaan ID produk
            const produk = await Produk.findById(produkId)
            if(!produk) {
                return res.status(404).send("Produk tidak ditemukan")
            }
            if(gambarPath && produk.Gambar) {
                const oldImagePath = path.join(__dirname,'../public/image',produk.Gambar)
                if(fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath)
                }
            }

            // update jika ada input baru, kalau kosong tetap pakai nilai yang lama
            produk.NamaProduk = namaproduk // karena sudah ada value di input, gausah pakai OR
            produk.Harga = harga
            produk.Stok = stok
            if (gambarPath) {  // Only update Gambar if new image is uploaded
                produk.Gambar = gambarPath
            }

            // simpan perubahan ke database
            await produk.save()
            res.redirect('/produk')
        } catch (error) {
            console.error("Error updating product: ",error)
            res.status(500).send("Internal Server Error")
        }
    },
    deleteProduk: async(req,res)=> {
        try {
            const produkId = req.params.id
            const produk = await Produk.findById(produkId)

            if(!produk) {
                return res.status(404).send("Produk tidak ditemukan")
            }
            // Hapus gambar kalau ada gambarnya 
            if(produk.Gambar) {
                const imagePath = path.join(__dirname,'../public/image/',produk.Gambar)
                if(fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            }
            // hapus data produk dari database
            await Produk.findByIdAndDelete(produkId)

            res.redirect('/produk')
        } catch (error) {
            console.error("Error deleting products: ",error)
            res.status(500).send("Internal Server Error")
        }
    }
}

module.exports = produkController