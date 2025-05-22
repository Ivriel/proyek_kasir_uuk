const pembelianController = require("../controllers/pembelianController")
const express = require("express")
const router = express.Router()
const checkSession = require("../middleware/checkSession")

router.get("/checkout",checkSession,pembelianController.getCheckout)
router.get("/pembayaran",checkSession,pembelianController.getPembayaranProduk)
router.get("/delete/:id",checkSession,pembelianController.deleteCartItem)
router.get("/:id",checkSession,pembelianController.pembelianProduk)


module.exports = router