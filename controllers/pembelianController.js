const Pembelian = require("../models/penjualanModel") // pembelian dinamai dari POV Pelanggan
const Produk = require("../models/produkModel")
const detailPenjualan = require("../models/detailpenjualanModel")
const Pelanggan = require("../models/pelangganModel")
const PDFReceipt = require('pdfkit')
const PDFDocumentTable = require('pdfkit-table')

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
                const produk_decrement = await Produk.findById(produk.produk_id)
                produk_decrement.Stok -= produk.jumlah
                await produk_decrement.save()
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
            document.text(`Date: ${pembelian.TanggalPenjualan.toLocaleDateString('id-ID',{weekday:'long'})}, ${pembelian.TanggalPenjualan.toLocaleDateString()} ${pembelian.TanggalPenjualan.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 100, 140)
            
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
    },
    showHistory: async(req,res)=> {
        try {
            const pembelian = await Pembelian.find()
           
             const dataPembelian = pembelian.map(data => {
                return {
                    ...data.toObject(),
                    PelangganID: data.PelangganID ? data.PelangganID._id : 'Unknown'
                };
            });

            res.render('historiPenjualan', { 
                pembelian: dataPembelian,
                path: '/pembelian/history',
                user: req.session.user
            });
        } catch (error) {
            console.error("Error fetching pembelian history:", error);
            res.status(500).send("Error fetching penjualan history");
        }
    },
    showDetailPenjualanHistori: async(req,res) => {
        try {
            const detailPenjualanItems = await detailPenjualan.find()
            const detailPenjualanData = detailPenjualanItems.map(data => {
                return {
                    ...data.toObject()
                }
            })
            console.log(detailPenjualanData)
            res.render('historiDetailPenjualan',{
                detailPenjualan:detailPenjualanData,
                path:'/pembelian/detailpenjualanhistory',
                user:req.session.user
            })
        } catch (error) {
            console.error("Error fetching detail penjualan histori: ",error)
            res.status(500).send("Error fetching detail penjualan histori")
        }
    },
    generateHistoriPDF: async(req, res) => {
        try {
            const pembelian = await Pembelian.find();
    
            const doc = new PDFDocumentTable({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=histori-penjualan.pdf');
            doc.pipe(res);
    
            const table = {
                title: "Histori Penjualan",
                subtitle: `Generated on: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID')}`,
                headers: [
                    { label: "No", property: 'no', width: 40 },
                    { label: "ID Penjualan", property: 'id', width: 120 },
                    { label: "Tanggal", property: 'tanggal', width: 100 },
                    { label: "Pelanggan ID", property: 'pelanggan', width: 180 },
                    { label: "Total Biaya", property: 'total', width: 100 }
                ],
                datas: pembelian.map((item, i) => ({
                    no: i + 1,
                    id: item._id.toString().slice(-8),
                    tanggal: new Date(item.TanggalPenjualan).toLocaleDateString('id-ID'),
                    pelanggan: item.PelangganID?._id?.toString() || '-',
                    total: `Rp ${item.TotalBiaya.toLocaleString('id-ID')}`
                }))
            };
    
            await doc.table(table, {
                prepareHeader: () => doc.font('Helvetica-Bold'),
                prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
            });
    
            doc.end();
        } catch (error) {
            console.error("Error generating histori PDF:", error);
            res.status(500).send("Error generating PDF");
        }
    }
}

module.exports = pembelianController