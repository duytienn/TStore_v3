// routes/checkout.route.js
const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/checkout.controller");

router.get("/cod", controller.cod);
router.get("/qr",  controller.qr);


router.get("/crypto", controller.crypto);
router.post("/order-crypto", controller.orderCrypto);

router.post("/order",   controller.order);
router.post("/orderqr", controller.orderQr);
router.get("/success/:id", controller.success);

module.exports = router;
