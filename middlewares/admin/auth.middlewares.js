const configSystem = require("../../config/system");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model.js");

module.exports.requireAuth = async (req, res, next) => {
    if(!req.cookies.token) {
        res.redirect(`${configSystem.prefixAdmin}/auth/login`);
        return;
    } else {
        const user = await Account.findOne({token : req.cookies.token}).select("-password");
        if(!user) {
            res.redirect(`${configSystem.prefixAdmin}/auth/login`);
        } else {
            const role = await Role.findOne({
                _id: user.role_id
            }).select("title permissions")
            // Biến toàn cục giống trong file index.jss dùng app.locals để tất cả các file pug đều dùng được biến này
            res.locals.user = user;
            res.locals.role = role;
        }
    };
    next();
}