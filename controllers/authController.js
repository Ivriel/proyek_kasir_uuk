const User = require("../models/userModel")
const Pelanggan = require("../models/pelangganModel")
const bcrypt = require("bcrypt")

const authController = {
    getRegister:(req,res) => {
        res.render('register')
    },
    getLogin:(req,res) => {
        res.render('login')
    },
    register: async(req,res) => {
        try {
            const {nama,alamat,telepon,username,password} = req.body

            // cek apakah username ada
            const existingUser = await User.findOne({username: username})
            if(existingUser) {
                return res.status(400).send("Username sudah digunakan")
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password,10)
            
            // buat user baru (pelanggan)
            const newPelanggan = new Pelanggan({
                NamaPelanggan: nama,
                Alamat: alamat,
                NomorTelepon: telepon
            })
            await newPelanggan.save()

            const newUser = new User({
                username,
                password: hashedPassword,
                role: 'Pelanggan'
            })
            await newUser.save()
            res.redirect("/auth/login")
        } catch (error) {
            console.error(error)
            res.status(500).send("Terjadi kesalahan saat registrasi")
        }
    }
}

module.exports = authController