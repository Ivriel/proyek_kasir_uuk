const pembelianController = require("../controllers/pembelianController")
const express = require("express")
const router = express.Router()
const checkSession = require("../middleware/checkSession")
const checkPermissionUser = require("../middleware/checkPermissionUser")

router.get("/checkout",checkPermissionUser(["Pelanggan"]),checkSession,pembelianController.getCheckout)
router.get("/pembayaran",checkPermissionUser(["Pelanggan"]),checkSession,pembelianController.getPembayaranProduk)
router.get("/history",checkSession,checkPermissionUser(["Admin","Petugas"]),pembelianController.showHistory)
router.get("/history/pdf",checkSession,checkPermissionUser(["Admin","Petugas"]),pembelianController.generateHistoriPDF)
router.get("/detailhistory/pdf",checkSession,checkPermissionUser(["Admin","Petugas"]),pembelianController.generateDetailHistoryPDF)
router.get("/detailpenjualanhistory",checkPermissionUser(["Admin","Petugas"]),checkSession,pembelianController.showDetailPenjualanHistori)
router.get("/delete/:id",checkPermissionUser(["Pelanggan"]),checkSession,pembelianController.deleteCartItem)
router.get("/:id",checkPermissionUser(["Pelanggan"]),checkSession,pembelianController.pembelianProduk)

module.exports = router