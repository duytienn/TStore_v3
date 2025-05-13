const Account = require("../../models/account.model");
const Role = require("../../models/role.model.js");
const configSystem = require("../../config/system");

const md5 = require("md5");

// [GET] admin/accounts
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    };

    const records = await Account.find(find).select("-password -token");

    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        });
        record.role = role;
    }
    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        records: records
    })
};


// [GET] admin/accounts/create
module.exports.create = async (req, res) => {
    const find = {
        deleted: false
    }

    const roles = await Role.find(find);
    res.render("admin/pages/accounts/create", {
        pageTitle: "Thêm mới tài khoản",
        roles: roles
    })
};

// [POST] admin/accounts/create
module.exports.createPost = async (req, res) => {
    const checkEmail = await Account.findOne({
        email: req.body.email,
        deleted: false
    });

    if (checkEmail) {
        req.flash('error', `Email đã tồn tại !`);
        res.redirect("back");
    } else {
        req.body.password = md5(req.body.password);

        const records = new Account(req.body);
        await records.save();

        res.redirect(`${configSystem.prefixAdmin}/accounts`)
    }

};

// [GET] admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;

    const record = await Account.findOne({
        _id: id
    });

    const roles = await Role.find({
        deleted: false
    });

    res.render("admin/pages/accounts/edit", {
        pageTitle: "Chỉnh sửa tài khoản",
        record: record,
        roles: roles,
    })

};

// [POST] admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    
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
