const { check } = require("express-validator");

module.exports.createPostValidate = [
    check("title")
        .notEmpty().withMessage("Tiêu đề không được để trống")
        .isLength({ min: 3 }).withMessage("Tiêu đề phải có ít nhất 3 ký tự"),
    check("code")
        .notEmpty().withMessage("Mã danh mục không được để trống")
        .isLength({ min: 1, max: 10 }).withMessage("Mã danh mục phải có từ 1-10 ký tự")
        .matches(/^[A-Za-z0-9]+$/).withMessage("Mã danh mục chỉ được chứa chữ cái và số")
];