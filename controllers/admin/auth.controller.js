const Account = require("../../models/account.model");

const configSystem = require("../../config/system");

const md5 = require("md5");

// [GET] admin/auth/login
module.exports.login = (req, res) => {
    if(req.cookies.token) {
        res.redirect(`${configSystem.prefixAdmin}/dashboard`);
    } else {
        res.render("admin/pages/auth/login", {
            pageTitle: "Trang đăng nhập"
        });
    }
};

// [POST] admin/auth/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await Account.findOne({
        email: email,
        deleted: false,
    });

    if(!user) {
        req.flash("error", "Email không tồn tại !");
        res.redirect("back");
        return;
    }

    if(md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu !");
        res.redirect("back");
        return;
    }

    if(user.status == "inactive") {
        req.flash("error", "Tài khoản đã bị khóa !");
        res.redirect("back");
        return;
    }

    res.cookie("token", user.token);
    res.redirect(`${configSystem.prefixAdmin}/setting/general`);
};

// [GET] admin/auth/logout
module.exports.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect(`${configSystem.prefixAdmin}/auth/login`);
};