const Product = require("../../models/product.model");
const productHelper = require("../../helpers/product");
const formSelectHelper = require("../../helpers/formSelect");
// [GET] /search
module.exports.index = async (req, res) => {
    const keyword = req.query.keyword;

    let newProducts = [];

    // sort-select
    let sort = formSelectHelper(req);

    if(keyword) {
        const keywordRegex = new RegExp(keyword, "i");
        const products = await Product.find({
            title: keywordRegex,
            status: "active",
            deleted: false
        }).sort(sort);

        newProducts = productHelper.priceNewProducts(products);
    }

    res.render("client/pages/search/index", {
        pageTitle: "Kết quả tìm kiếm",
        keyword: keyword,
        products: newProducts
    })
}