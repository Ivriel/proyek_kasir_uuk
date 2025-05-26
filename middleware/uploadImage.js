const multer = require("multer")

let storage = multer.diskStorage({ // konfigurasi cara simpan file 
    destination:function(req,file,cb) { // tempat simpan
        cb(null,"public/image") // callback function buat nyimpan ke tempat
    },
    filename:function(req,file,cb) { // kasih nama file yang disimpan
        cb(null, Date.now() + "-" + file.originalname) 
    }
})

let uploadImage = multer({storage:storage}) // pakai storage yang udah diatur tadi
module.exports = uploadImage