const express = require("express");
const router = express.Router();

const userVaildate = require("../../validates/client/user.validate")

const controller = require("../../controllers/client/user.controller");

const authMiddleware = require("../../middlewares/client/auth.middleware");

router.get('/register', controller.register);

router.post('/register', userVaildate.registerPost ,controller.postRegister);

router.get('/login', controller.login);

router.post('/login',userVaildate.registerPost,controller.postLogin);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.passwordForgot);

router.post("/password/forgot", userVaildate.passwordForgot, controller.passwordForgotPost);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", userVaildate.otp,controller.otpPost);

router.get("/password/reset", controller.resetPassword);

router.post("/password/reset", userVaildate.resetPassword,controller.resetPasswordPost);

router.get("/info",authMiddleware.requireAuth, controller.info);

router.get("/order-history", controller.orderHistory);

router.delete("/order-history/delete/:id", controller.cancelOrder);

module.exports = router;