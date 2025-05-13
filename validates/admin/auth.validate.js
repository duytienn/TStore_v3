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
