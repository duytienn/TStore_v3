const express = require("express");
const router = express.Router();
const exportController = require("../../controllers/admin/export-orders.controller");

router.get("/orders", exportController.exportForm);
router.post("/orders", exportController.exportOrders);

module.exports = router;