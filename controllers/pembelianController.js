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
            const jumlah = parseInt(req.query.jumlah) || 1 // Get quantity from query parameter, default to 1
            const harga = await Produk.findById(produk_id).select("Harga")
            const nama = await Produk.findById(produk_id).select("NamaProduk")
            
            // Inisialisasi array . diisi dari req session keranjang atau array kosong kalau req session keranjang belum terisi
            let keranjang = req.session.keranjang || [] 
            
            if(keranjang.find(item => item.produk_id === produk_id)) { // buat ngecek apakah produk dengan id yang sama udah pernah ditambahkan
                keranjang.find(item => item.produk_id === produk_id).jumlah += jumlah // kalau udah berarti tambah jumlahnhya
            } else {// kalau belum masukkan produk baru ke keranjang
                keranjang.push(
                    {
                    produk_id: produk_id,
                    jumlah: jumlah,
                    harga: harga.Harga,
                    nama:nama.NamaProduk
                })
            }
            
            // Kalau belum ada req session keranjang, bikin. Kalau udah ada , tumpuk pakai data baru.
            req.session.keranjang = keranjang
            res.redirect("/produk/pelanggan")
        } catch (error) {
            console.error("Cannot add pembelian produk: ",error)
        }
    },
    getCheckout: async(req,res) => {
        // ambil data keranjang yang udah di set. kalau gada datanya diganti pakai array kosongan
        try {
            const keranjang = req.session.keranjang || []
            res.render('checkoutPage', {
                path: '/pembelian/checkout', // buat nandain halaman aktif
                user: req.session.user,
                keranjang: keranjang
            })
        } catch (error) {
            console.error("Error in checkout: ", error)
            res.redirect("/produk/pelanggan")
        }
    },
    getPembayaranProduk: async(req,res) => {
        try { // ngitung total pembelian
            let total = 0;
            req.session.keranjang.forEach(produk => {
                const subtotal = produk.jumlah * produk.harga; // harga per produk dikali jumlah dibelinya
                total += subtotal; // total semuanya 
            });
            const pembelian = new Pembelian({
                TanggalPenjualan: new Date(),
                TotalBiaya: total,
                PelangganID: req.session.user.id
            })
            await pembelian.save()

            // Simpan dulu semua detail penjualan 
            for (const produk of req.session.keranjang) { // jabarka  semua produk di keranjang
                const subtotal = produk.jumlah * produk.harga 
                const detailpenjualan = new detailPenjualan({
                    PenjualanID: pembelian.id,
                    ProdukID: produk.produk_id,
                    JumlahProduk: produk.jumlah,
                    Subtotal: subtotal
                })
                const produk_decrement = await Produk.findById(produk.produk_id) // nyari id buat ngurangin stok
                produk_decrement.Stok -= produk.jumlah
                await produk_decrement.save()
                await detailpenjualan.save()
            }

            // salin data keranjang buat ditaruh PDF pakai spread operator...
            const cartData = [...req.session.keranjang];
                 // Bersihkan dulu sebelum di checkout
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
            document.text(`Customer ID: ${pembelian.PelangganID}`, 100, 160)
            
            let y = 200;
            for (const produk of cartData) {
                const subtotal = produk.jumlah * produk.harga
                document.text(produk.nama, 100, y)
                document.text(produk.jumlah.toString(), 300, y)
                document.text(`Rp ${subtotal.toLocaleString()}`, 400, y)
                y += 20;
            }
            
            // Total harga 
            document.text(`Total: Rp ${pembelian.TotalBiaya.toLocaleString()}`, 400, y + 20)
            
            
            // Set ke response http biar bisa di downloadw
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
            req.session.keranjang.splice(index, 1) // posisi item yang akan dihapus, hapus 1 elemen di posisi itu 
            res.redirect('/pembelian/checkout')
        } catch (error) {
            console.error("Cannot delete cart item: ", error)
            res.redirect('/pembelian/checkout')
        }
    },
    showHistory: async(req,res)=> {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            // Get total count for pagination
            const totalItems = await Pembelian.countDocuments();
            const totalPages = Math.ceil(totalItems / limit);

            // Get paginated data
            const pembelian = await Pembelian.find()
                .skip(skip)
                .limit(limit)
                .sort({ TanggalPenjualan: -1 }); // Sort by date, newest first
           
            const dataPembelian = pembelian.map(data => {
                return {
                    ...data.toObject(),
                    PelangganID: data.PelangganID ? data.PelangganID._id : 'Unknown'
                };
            });

            res.render('historiPenjualan', { 
                pembelian: dataPembelian,
                path: '/pembelian/history',
                user: req.session.user,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        } catch (error) {
            console.error("Error fetching pembelian history:", error);
            res.status(500).send("Error fetching penjualan history");
        }
    },
    showDetailPenjualanHistori: async(req,res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;

            // Get total count for pagination
            const totalItems = await detailPenjualan.countDocuments();
            const totalPages = Math.ceil(totalItems / limit);

            // Get paginated data
            const detailPenjualanItems = await detailPenjualan.find()
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 }); // Sort by ID, newest first

            const detailPenjualanData = detailPenjualanItems.map(data => {
                return {
                    ...data.toObject()
                }
            });

            res.render('historiDetailPenjualan',{
                detailPenjualan: detailPenjualanData,
                path:'/pembelian/detailpenjualanhistory',
                user: req.session.user,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
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
                    { label: "ID Penjualan", property: 'id', width: 140 },
                    { label: "Tanggal", property: 'tanggal', width: 100 },
                    { label: "Pelanggan ID", property: 'pelanggan', width: 180 },
                    { label: "Total Biaya", property: 'total', width: 100 }
                ],
                datas: pembelian.map((item, i) => ({
                    no: i + 1,
                    id: item._id.toString(),
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
    },
    generateDetailHistoryPDF: async(req,res)=> {
        try {
            const detailpenjualan = await detailPenjualan.find()
            const doc = new PDFDocumentTable({ margin: 50 });   
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=histori-detail-penjualan.pdf');
            doc.pipe(res);
            const table = {
                title:"Histori Detail Penjualan",
                subtitle: `Generated on: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID')}`,
                headers: [
                    { label: "No", property: 'no', width: 20 },
                    {label: "ID Detail Penjualan", property:'id',width:140},
                    { label: "ID Penjualan", property: 'idpenjualan', width: 140},
                    { label: "ID Produk", property: 'idproduk', width: 140 },
                    {label: "Jumlah Produk",property:'jumlahproduk',width:60},
                    {label:"Subtotal",property:'subtotal',width:100}
                ],
                datas: detailpenjualan.map((item, i) => ({
                    no: i + 1,
                    id: item._id.toString(),
                    idpenjualan: item.PenjualanID?._id?.toString() || '-',
                    idproduk: item.ProdukID?._id?.toString() || '-',
                    jumlahproduk: item.JumlahProduk,
                    subtotal: `Rp ${item.Subtotal.toLocaleString('id-ID')}`
                }))
            }
            await doc.table(table, {
                prepareHeader: () => doc.font('Helvetica-Bold'),
                prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
            });
    
            doc.end();
        } catch (error) {
            console.error("Error generated detail histori PDF:", error);
            res.status(500).send("Error generating PDF")
        }
    }
}

module.exports = pembelianController