const router = require("express").Router();
const { body } = require("express-validator");

const {
    homePage,
    register,
    registerPage,
    login,
    loginPage,
} = require("./userController");

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.userID){
        return res.redirect('/anasayfa');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.userID){
        return res.redirect('/home');
    }
    next();
}

router.get('/home', ifNotLoggedin, homePage);

router.get("/login", ifLoggedin, loginPage);
router.post("/login",
ifLoggedin,
    [
        body("_username", "Geçersiz kullanıcı adı")
            .notEmpty()
            .escape()
            .trim(),
        body("_password", "Şifre en az 4 karakter olmalıdır")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);

router.get("/signup", ifLoggedin, registerPage);
router.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "Adınız en az 3 karakter içermelidir")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_surname", "Soyadınız en az 3 karakter içermelidir")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }), 
        body("_username", "Kullanıcı adınız en az 4 karakter olmalıdır")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 4 }),   
        body("_email", "Geçersiz e-posta adresi")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "Şifre en az 4 karakter olmalıdır")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    register
);

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/anasayfa');
});

router.get('/anasayfa', function(request, response) {
	response.render('anasayfa')
});

router.get('/hesabim', function(request, response) {
	response.render('hesabim')
});

module.exports = router;