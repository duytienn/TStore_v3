const Account = require("../../models/account.model");
const Role = require("../../models/role.model.js");
const configSystem = require("../../config/system");

const md5 = require("md5");

// [GET] admin/my-account
module.exports.index = (req, res) => {
    res.render("admin/pages/my-account/index", {
        pageTitle: "Thông tin cá nhân"
    })
};

// [GET] admin/my-account/edit
module.exports.edit = async (req, res) => {
    res.render("admin/pages/my-account/edit", {
        pageTitle: "Chỉnh sửa thông tin cá nhân"
    })
};

// [PATCH] admin/my-account/edit
module.exports.editPatch = async (req, res) => {
    const id = res.locals.user.id;
    
    const checkEmail = await Account.findOne({
        _id: { $ne: id},
        email: req.body.email,
        deleted: false
    });

    if (checkEmail) {
        req.flash('error', `Email đã tồn tại !`);
        res.redirect("back");
    } else {

        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        };

        await Account.updateOne({ _id: id }, req.body);

        req.flash("success", "Bạn đã thay đổi thành công !");

        res.redirect("back");
    }

};