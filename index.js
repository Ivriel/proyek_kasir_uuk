const express = require("express");
const app = express();
const mongoDB = require("./database/mongo");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const path = require("path")
const session = require("express-session")

const authRoutes = require("./routes/authRoutes")
const produkRoutes = require("./routes/produkRoutes")

mongoDB();

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))

app.use("/auth",authRoutes)
app.use("/produk",produkRoutes)
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(
    session({
        secret:"project-uuk-kasir",
        resave:false, // hindari menyimpan ulang session jika tidak berubah
        saveUninitialized:false, // tidak menyimpan session kosong
        cookie: {
            secure:false, // ubah ke true kalau pakai https
            maxAge:1000 * 60 * 60 // 1 jam
        }
    })
)

app.get("/",(req,res)=> {
    res.redirect("/auth/login")
})

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
});
