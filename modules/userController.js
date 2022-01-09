const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("./dbConnection");


// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `kullanicilar` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('home', {
        user: row[0]
    });
}

// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute(
            "SELECT * FROM `kullanicilar` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('register', {
                error: 'E-posta zaten kayıtlı'
            });
        }

        const hashPass = await bcrypt.hash(body._password, 12);

        const [rows] = await dbConnection.execute(
            "INSERT INTO `kullanicilar`(`name`,`surname`,`username`,`email`,`password`) VALUES(?,?,?,?,?)",
            [body._name,body._surname,body._username, body._email, hashPass]
        );

        if (rows.affectedRows !== 1) {
            return res.render('register', {
                error: 'Kayıt başarısız oldu..'
            });
        }
        
        res.render("register", {
            msg: 'Başarıyla kayıt olundu..'
        });

    } catch (e) {
        next(e);
    }
};

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

// Login User
exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute('SELECT * FROM `kullanicilar` WHERE `username`=?', [body._username]);

        if (row.length != 1) {
            return res.render('login', {
                error: 'Kullanıcı adı yanlış..'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);

        if (checkPass === true) {
            req.session.userID = row[0].id;
            return res.redirect('/home');
        }

        res.render('login', {
            error: 'Yanlış şifre girdiniz..'
        });


    }
    catch (e) {
        next(e);
    }

}