const express = require("express");
const app = express();
const mongoDB = require("./database/mongo");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const path = require("path")
const session = require("express-session")
const userMiddleware = require('./middleware/checkRole');

mongoDB();

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))


app.use(
    session({
        secret:"project-uuk-kasir",
        resave:false,
        saveUninitialized:false,
        cookie: {
            secure:false,
            maxAge:1000 * 60 * 60
        }
    })
)
app.use((req,res,next)=> {
    res.locals.user = req.session.user || null;
    next()
})


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(userMiddleware)


const authRoutes = require("./routes/authRoutes")
const produkRoutes = require("./routes/produkRoutes")
const pembelianRoutes = require("./routes/pembelianRoutes")

app.use("/auth",authRoutes)
app.use("/produk",produkRoutes)
app.use("/pembelian",pembelianRoutes)

app.get("/",(req,res)=> {
    res.redirect("/auth/login")
})

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
});