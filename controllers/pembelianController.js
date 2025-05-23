const Pembelian = require("../models/penjualanModel") // pembelian dinamai dari POV Pelanggan
const Produk = require("../models/produkModel")
const detailPenjualan = require("../models/detailpenjualanModel")
const PDFReceipt = require('pdfkit')

const pembelianController = {
    pembelianProduk: async(req,res) => {
        try {
            const produk_id = req.params.id
            const jumlah = 1
            const harga = await Produk.findById(produk_id).select("Harga")
            const nama = await Produk.findById(produk_id).select("NamaProduk")
            
            // Inisialisasi keranjang . diisi dari req session keranjang atau array kosong kalau re.session keranjang belum terisi
            let keranjang = req.session.keranjang || [] // keranjang setelah session itu variabel bebas
            
            if(keranjang.find(item => item.produk_id === produk_id)) {
                keranjang.find(item => item.produk_id === produk_id).jumlah += jumlah
            } else {// masukkan produk ke keranjang
                keranjang.push(
                    {
                    produk_id: produk_id,
                    jumlah: jumlah,
                    harga: harga.Harga,
                    nama:nama.NamaProduk
                })
            }
            
            // Kalau belum ada req session keranjang, bikin. Kalauudah ada , tumpuk.
            req.session.keranjang = keranjang
            res.redirect("/produk/pelanggan")
        } catch (error) {
            console.error("Cannot add pembelian produk: ",error)
        }
    },
    getCheckout: async(req,res) => {
        try {
            const keranjang = req.session.keranjang || []
            res.render('checkoutPage', {
                path: '/pembelian/checkout',
                user: req.session.user,
                keranjang: keranjang
            })
        } catch (error) {
            console.error("Error in checkout: ", error)
            res.redirect("/produk/pelanggan")
        }
    },
    getPembayaranProduk: async(req,res) => {
        try {
            let total = 0;
            req.session.keranjang.forEach(produk => {
                const subtotal = produk.jumlah * produk.harga;
                total += subtotal;
            });
            const pembelian = new Pembelian({
                TanggalPenjualan: new Date(),
                TotalBiaya: total,
                PelangganID: req.session.user.id
            })
            await pembelian.save()

            // Save all detail penjualan first
            for (const produk of req.session.keranjang) {
                const subtotal = produk.jumlah * produk.harga
                const detailpenjualan = new detailPenjualan({
                    PenjualanID: pembelian.id,
                    ProdukID: produk.produk_id,
                    JumlahProduk: produk.jumlah,
                    Subtotal: subtotal
                })
                await detailpenjualan.save()
            }

            // Clear cart before generating PDF
            const cartData = [...req.session.keranjang];
            req.session.keranjang = [];

            // Bikin PDF
            const document = new PDFReceipt();
            
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${pembelian.id}.pdf`);
            
            // Add content to PDF
            document.fontSize(25).text('KasirKita', 100, 80)
            document.fontSize(12).text(`Invoice ID #:${pembelian.id}`, 100, 120)
            document.text(`Date: ${pembelian.TanggalPenjualan}`, 100, 140)
            
            let y = 180;
            for (const produk of cartData) {
                const subtotal = produk.jumlah * produk.harga
                document.text(produk.nama, 100, y)
                document.text(produk.jumlah.toString(), 300, y)
                document.text(`Rp ${subtotal.toLocaleString()}`, 400, y)
                y += 20;
            }
            
            // Total harga 
            document.text(`Total: Rp ${pembelian.TotalBiaya.toLocaleString()}`, 400, y + 20)
            
            // Add a script to redirect after download
            document.text('', 100, y + 60); // Add some space
            document.text('Redirecting to products page...', 100, y + 80);
            
            // Pipe the PDF to response
            document.pipe(res);
            
            // Finalize PDF
            document.end();

            
        } catch (error) {
            console.error("Cannot run getPembayaranProduk: ", error)
            res.redirect('/pembelian/checkout')
        }
    },
    deleteCartItem: async(req,res) => {
        try {
            const index = parseInt(req.params.id)
            req.session.keranjang.splice(index, 1)
            res.redirect('/pembelian/checkout')
        } catch (error) {
            console.error("Cannot delete cart item: ", error)
            res.redirect('/pembelian/checkout')
        }
    }
}

module.exports = pembelianController