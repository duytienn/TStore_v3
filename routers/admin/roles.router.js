const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/roles.controller");

router.get("/", controller.index);

router.get("/create", controller.createRoles);

router.post("/create", controller.createPost);

router.get("/permissions", controller.permissions);

router.patch("/permissions", controller.permissionsPatch);

module.exports = router;