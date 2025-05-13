const dashboardRoutes = require("./dashboard.router");

const productsRoutes = require("./products.router");

const categoryRoutes = require("./products-category.router");

const roleRoutes = require("./roles.router");

const authRoutes = require("./auth.route");

const accountRoutes = require("./account.route");

const myAccountdRoutes = require("./my-account.route");

const settingRoutes = require("./setting.route");

const orderRoutes = require("./orders.route");

const authMiddleware = require("../../middlewares/admin/auth.middlewares");

const systemConfig = require("../../config/system");


module.exports = (app) => {
    const PATH_ADMIN = systemConfig.prefixAdmin;

    app.use(
        PATH_ADMIN + "/dashboard",
        authMiddleware.requireAuth,
        dashboardRoutes
    );

    app.use(
        PATH_ADMIN + "/products", 
        authMiddleware.requireAuth,
        productsRoutes
    );

    app.use(
        PATH_ADMIN + "/products-category", 
        authMiddleware.requireAuth,
        categoryRoutes
    );

    app.use(
        PATH_ADMIN + "/roles",
        authMiddleware.requireAuth, 
        roleRoutes
    );

    app.use(
        PATH_ADMIN + "/accounts",
        authMiddleware.requireAuth, 
        accountRoutes
    );

    app.use(PATH_ADMIN + "/auth", authRoutes);

    app.use(
        PATH_ADMIN + "/my-account",
        authMiddleware.requireAuth,
        myAccountdRoutes
    );

    app.use(
        PATH_ADMIN + "/setting",
        authMiddleware.requireAuth,
        settingRoutes
    );

    app.use(
        PATH_ADMIN + "/orders",
        authMiddleware.requireAuth,
        orderRoutes
    )
}