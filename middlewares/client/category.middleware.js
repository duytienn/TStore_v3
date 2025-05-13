const ProductCategory = require("../../models/product-category.model");
const createTreeHelper = require("../../helpers/createTree");


module.exports.category = async (req, res, next) => {
    const productsCategory = await ProductCategory.find({
        deleted: false,
        status: "active"
    });

    const newProductsCategory = createTreeHelper.tree(productsCategory);

    res.locals.layoutsProductsCategory = newProductsCategory,
    
    next();
}