const authController = require("../controllers/authController")
const express = require("express")
const router = express.Router()

router.get("/register",authController.getRegister)
router.get("/login",authController.getLogin)
router.get("/logout",authController.logout)

router.post("/register",authController.register) // kirim data tanpa terlihat di URL (buat pengamanan)
router.post("/login",authController.login)

module.exports = router