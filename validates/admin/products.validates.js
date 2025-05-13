module.exports.createPostValidate = (req, res, next) => {
    if(req.body.title == ""){
        req.flash('error', 'Mời bạn hãy nhập thông tin');
        res.redirect("back");
        return;
    };
    next();
}