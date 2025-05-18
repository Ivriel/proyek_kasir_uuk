const produkController = require("../controllers/produkController")
const express = require("express")
const router = express.Router()

router.get("/",produkController.getDaftarProduk)
module.exports = router