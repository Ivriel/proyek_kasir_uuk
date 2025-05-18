const authController = require("../controllers/authController")
const express = require("express")
const router = express.Router()

router.get("/register",authController.getRegister)
router.get("/login",authController.getLogin)

module.exports = router