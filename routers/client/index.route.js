const categoryMiddleware = require("../../middlewares/client/category.middleware");

const cartMiddleware = require("../../middlewares/client/cart.middleware");

const usertMiddleware = require("../../middlewares/client/user.middleware");

const settingGeneralMiddleware = require("../../middlewares/client/setting.middleware");

const authMiddleware = require("../../middlewares/client/auth.middleware");

const homeRouter  = require("./home.route");
const productRouter = require("./product.route");
const searchRouter = require("./search.route");
const cartRouter = require("./cart.route");
const checkoutRouter = require("./checkout.route");
const userRouter = require("./user.route");
const chatRouter = require("./chat.route");
const usersRouter = require("./users.route");
const RoomsChatRouter = require("./rooms-chat.route");
const chatGPTRouter = require("./chatgpt.route");

module.exports = (app) => {

    app.use(categoryMiddleware.category);

    app.use(cartMiddleware.cartId);

    app.use(usertMiddleware.infoUser);

    app.use(settingGeneralMiddleware.settingGeneral);

    app.use("/",  homeRouter);
    
    app.use("/products", productRouter);

    app.use("/search", searchRouter);

    app.use("/cart", authMiddleware.requireAuth ,cartRouter);

    app.use("/checkout", checkoutRouter);

    app.use("/user", userRouter);

    app.use("/chat", authMiddleware.requireAuth, chatRouter);

    app.use("/users", authMiddleware.requireAuth, usersRouter);

    app.use("/rooms-chat", authMiddleware.requireAuth, RoomsChatRouter);

    app.use("/chat-gpt", authMiddleware.requireAuth, chatGPTRouter);
}