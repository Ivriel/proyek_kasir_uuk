const produkController = require("../controllers/produkController")
const express = require("express")
const router = express.Router()
const checkSession = require("../middleware/checkSession")

router.get("/",produkController.getDaftarProduk)

module.exports = router