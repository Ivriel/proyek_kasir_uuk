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
    },
    login: async(req,res) =>{
        try {
            const {username,password} = req.body
            
            // Validate input
            if (!username || !password) {
                return res.status(400).send("Username dan password harus diisi")
            }

            // Find user
            const user = await User.findOne({username: username})
            if(!user) {
                return res.status(400).send("Username atau password salah")
            }
            console.log(username)
            console.log(password)

            // Validate password
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return res.status(400).send("Username atau password salah")
            }

            // Set session data
            req.session.user = {
                id: user._id,
                username: user.username,
                role: user.role
            }
            if(user.role === "Admin" || user.role==="Petugas") {
                res.redirect("/produk")
            } else {
                res.redirect("/produk/pelanggan")
            }
        } catch (error) {
            console.error("Login error:", error)
            res.status(500).send("Terjadi kesalahan saat login")
        }
    },
    logout: async(req,res) => {
        req.session.destroy((err)=>{
            if(err) {
                console.error(err)
                return res.status(500).send("Gagal Logout")
            }
            res.redirect("/auth/login")
        })
    }
}

module.exports = authController