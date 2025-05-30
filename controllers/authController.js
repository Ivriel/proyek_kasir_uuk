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
            const {nama,alamat,telepon,username,password} = req.body // buat ngambil dari input elemen html

            // cek apakah username ada
            const existingUser = await User.findOne({username: username})
            if(existingUser) {
                return res.status(400).send("Username sudah digunakan")
            }

            // hashing password buat enkripsi
            const hashedPassword = await bcrypt.hash(password,10)
            
            // buat user baru (otomatis pelanggan)
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
            
            // Validasi input
            if (!username || !password) {
                return res.status(400).send("Username dan password harus diisi")
            }

            // Cari user di database berdasarkan username 
            const user = await User.findOne({username: username})
            if(!user) {
                return res.status(400).send("Username atau password salah")
            }
          
            // tempat check username pw

            
            // Validasi password. bandingkan pw yang diinput sama pw yang ada
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return res.status(400).send("Username atau password salah")
            }

            // Set session data yang baru login
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
        req.session.destroy((err)=>{ // metode express buat hapus sesi user
            if(err) {
                console.error(err)
                return res.status(500).send("Gagal Logout")
            }
            res.redirect("/auth/login")
        })
    }
}

module.exports = authController