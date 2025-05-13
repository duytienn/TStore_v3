const express = require("express");

const router = express.Router();

const controller = require("../../controllers/admin/orders.controller.js")

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.patchStatus);

module.exports = router;