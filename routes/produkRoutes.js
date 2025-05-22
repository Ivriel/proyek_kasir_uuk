const produkController = require("../controllers/produkController")
const express = require("express")
const router = express.Router()
const checkSession = require("../middleware/checkSession")
const uploadImage = require("../middleware/uploadImage")


router.get("/",checkSession, produkController.getDaftarProduk)
router.get("/tambah",checkSession,produkController.getTambahProduk)
router.get("/edit/:id",checkSession,produkController.getEditProduk)
router.get("/pelanggan",checkSession,produkController.getDaftarProdukPelanggan)
router.post("/tambah",checkSession,uploadImage.single("gambar"),produkController.tambahProduk)
router.post("/edit/:id",checkSession,uploadImage.single("gambar"),produkController.editProduk)
router.get("/delete/:id",checkSession,produkController.deleteProduk)

module.exports = router