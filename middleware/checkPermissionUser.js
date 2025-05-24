const checkPermissionUser = (roles) => (req,res,next) => {
    const userRole = req.session.user.role
    if(Array.isArray(roles) && roles.includes(userRole)) {
        next()
    } else {
        res.redirect("/auth/login")
    }
}
module.exports = checkPermissionUser