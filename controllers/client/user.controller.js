const md5 = require("md5");
const User = require("../../models/users.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");

const generateHelper = require("../../helpers/generate");

const sendMailHelper = require("../../helpers/sendMail");

const statusSocket = require("../../sockets/client/status.socket");

const totalPriceHelper = require("../../helpers/totalPrice");
//[GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký"
    })
}

//[POST] /user/register
module.exports.postRegister = async (req, res) => {
    const exitsEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(exitsEmail) {
        req.flash("error", "Email đã tồn tại !");
        res.redirect("back");
        return;
    }

    req.body.password = md5(req.body.password);

    const user = new User(req.body);
    await user.save();
    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/login");
}

//[GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập"
    })
}

//[POST] /user/login
module.exports.postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false,
    });

    if(!user) {
        req.flash("error", "Email không tồn tại !");
        res.redirect("back");
        return;
    }

    if(md5(password) != user.password) {
        req.flash("error", "Sai mật khẩu !");
        res.redirect("back");
        return;
    }

    if(user.status == "inactive") {
        req.flash("error", "Tài khoản đã bị khóa !");
        res.redirect("back");
        return;
    }

    res.cookie("tokenUser", user.tokenUser);
    // Cap nhat trang thai online
    await User.updateOne({
        _id: user.id,
    },{
        statusOnline: "online"
    })
    //Luu user_id vao collections cart
    await Cart.updateOne(
        {
        _id: req.cookies.cartId
        },
        {
            user_id: user.id
        }
    )
    res.redirect(`/`);

    //socket
    statusSocket.userOnline(user.id);
    //socket
};

//[GET] /user/logout
module.exports.logout = async (req, res) => {
    // Cap nhat trang thai offline
    await User.updateOne({
        _id: res.locals.user.id,
    },{
        statusOnline: "offline"
    })

    res.clearCookie("tokenUser");

    res.redirect("/");

    //socket
    statusSocket.userOffline(res.locals.user.id);
    //socket
}

//[GET] /user/password/forgot
module.exports.passwordForgot = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Quên mật khẩu",
    })
}

//[POST] /user/password/forgot
module.exports.passwordForgotPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user) {
        req.flash("error", "Email không tồn tại !");
        res.redirect("back");
        return;
    };

    // Việc 1: Tạo ra mã OTP và lưu thông tin yêu cầu vào collection
    const otp = generateHelper.generateRamdomNumber(8);

    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);

    await forgotPassword.save();


    // Việc 2: Gửi mã OTP qua email
    //Gmail phải bật xác minh 2 bước mới có thể gửi mail tự động và tạo mật khẩu ứng dụng
    const subject = "Mã OTP xác minh lấy lại mật khẩu !";
    const html = `Mã OTP xác minh lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là 3 phút. Lưu ý không được để lộ mã OTP.`
    sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp?email=${email}`);
}

//[GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    res.render("client/pages/user/otp", {
        pageTitle: "Nhập mã OTP",
        email: req.query.email
    })
}

//[POST] /user/password/otp
module.exports.otpPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });


    if(!result) {
        req.flash("error", "OTP không hợp lệ !");
        res.redirect("back");
        return;
    }

    const user = await User.findOne({
        email: email
    });

    res.cookie("tokenUser", user.tokenUser)  ;

    res.redirect("/user/password/reset");
}

//[GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password", {
        pageTitle: "Đổi mật khẩu"
    })
}

//[POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;
    await User.updateOne({
        tokenUser: tokenUser
    },{
        password: md5(password)
    })
    req.flash("success", "Bạn đã cập nhật mật khẩu thành công !");

    res.redirect("/");
}

//[GET] /user/info
module.exports.info = async (req, res) => {
    res.render("client/pages/user/info", {
        pageTitle: "Thông tin khách hàng"
    })
}

//[GET] /user/order-history
module.exports.orderHistory = async (req, res) => {
    const user_id = res.locals.user.id;
    const orders = await Order.find({
        user_id: user_id,
        deleted: false
    })
    if (orders) {
        for(const order of orders) {
            await totalPriceHelper(order);
            order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
        }
    }
    res.render("client/pages/user/order-history", {
        pageTitle: "Lịch sử đặt hàng",
        orders: orders
    })
}

//[DELETE] /user/order-history/delete/:id
module.exports.cancelOrder = async (req, res) => {
    try {
        const id = req.params.id;
        await Order.updateOne({_id: id}, {
            deleted: true
        });

        req.flash('success', 'Bạn đã hủy đơn hàng thành công!');
        res.redirect("back");
    } catch (error) {
        res.redirect("back");
    }
}
