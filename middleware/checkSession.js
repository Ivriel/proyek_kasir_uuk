const checkSession = (req,res,next) => {
    if(req.session && req.session.user) { // cek kalau sesi ada dan data user disimpan disitu
        next() // kalau valid bisa lanjut  ke next operasion / middleware 
    } else{
        res.redirect("/auth/login")
    }
}

module.exports = checkSession