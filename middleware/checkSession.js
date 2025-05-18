const checkSession = (req, res, next) => {
    // Check if session exists and has user data
    if (req.session && req.session.user) {
        // Add user data to res.locals for use in templates
        res.locals.user = req.session.user
        next()
    } else {
        // Store the original URL to redirect back after login
        req.session.returnTo = req.originalUrl
        res.redirect("/auth/login")
    }
}

// Middleware to check specific roles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.session.returnTo = req.originalUrl
            return res.redirect("/auth/login")
        }

        if (!roles.includes(req.session.user.role)) {
            return res.status(403).send("Akses ditolak: Anda tidak memiliki izin untuk mengakses halaman ini")
        }

        next()
    }
}

module.exports = {
    checkSession,
    checkRole
}