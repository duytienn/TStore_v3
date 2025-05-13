const express = require("express");
const multer  = require('multer');

const upload = multer();
const router = express.Router();

const controller = require("../../controllers/admin/account.controller");
const validates = require("../../validates/admin/accounts.validate");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middlewares");


router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single('avatar'),
    uploadCloud.upload,
    validates.createPostValidate,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.single('avatar'),
    uploadCloud.upload,
    validates.editPostValidate,
    controller.editPatch);

module.exports = router;