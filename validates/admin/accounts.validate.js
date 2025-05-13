module.exports.createPostValidate = (req, res, next) => {
    if(req.body.fullName == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
};


module.exports.createPostValidate = (req, res, next) => {
    if(req.body.password == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
};

module.exports.createPostValidate = (req, res, next) => {
    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
}

module.exports.editPostValidate = (req, res, next) => {
    if(req.body.fullName == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
};

module.exports.editPostValidate = (req, res, next) => {
    if(req.body.email == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
}