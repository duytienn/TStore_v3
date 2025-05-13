module.exports.registerPost = (req, res, next) => {
    if(req.body.password == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    if(req.body.fullName == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    next();
};

module.exports.loginPost = (req, res, next) => {
    if(req.body.password == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    next();
};

module.exports.passwordForgot = (req, res, next) => {
    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    next();
};

module.exports.otp = (req, res, next) => {
    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    next();
};



module.exports.resetPassword = (req, res, next) => {
    if(req.body.password == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    if(req.body.confirmPassword == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };

    if(req.body.password != req.body.confirmPassword) {
        req.flash('error', 'Mật khẩu xác nhận không trùng khớp !');
        res.redirect("back");
        return;
    }
    next();
};


