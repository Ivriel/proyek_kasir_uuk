const produkController = require("../controllers/produkController")
const express = require("express")
const router = express.Router()
const checkSession = require("../middleware/checkSession")
const uploadImage = require("../middleware/uploadImage")
const checkPermissionUser = require("../middleware/checkPermissionUser")

router.get("/",checkSession, checkPermissionUser(["Admin","Petugas"]), produkController.getDaftarProduk)
router.get("/tambah",checkSession,checkPermissionUser(["Admin","Petugas"]),produkController.getTambahProduk)
router.get("/edit/:id",checkSession,checkPermissionUser(["Admin","Petugas"]),produkController.getEditProduk)
router.get("/pelanggan",checkSession,checkPermissionUser(["Pelanggan"]),produkController.getDaftarProdukPelanggan)
router.post("/tambah",checkSession,checkPermissionUser(["Admin","Petugas"]),uploadImage.single("gambar"),produkController.tambahProduk)
router.post("/edit/:id",checkSession,checkPermissionUser(["Admin","Petugas"]),uploadImage.single("gambar"),produkController.editProduk)
router.get("/delete/:id",checkSession,checkPermissionUser(["Admin","Petugas"]),produkController.deleteProduk)

module.exports = router