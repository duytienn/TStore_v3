const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Comment = require("../../models/comment.model");
const User = require("../../models/users.model");
const productHelper = require("../../helpers/product");
const productCategoryHelper = require("../../helpers/productCategory");
const formSelectHelper = require("../../helpers/formSelect");
const commentSocket = require("../../sockets/client/comment.socket");
// [GET] products
module.exports.index = async (req, res) => {
    // sort-select
    let sort = formSelectHelper(req);
    const products = await Product.find({
        status: "active",
        deleted: false
    }).sort(sort);

    const newProducts = productHelper.priceNewProducts(products);


    res.render("client/pages/product/index", {
        pageTitle: "Danh sách sản phẩm",
        products: newProducts
    });
};

// [GET] products/detail/:slugProduct
module.exports.detailProduct = async (req, res) => {
    const slugProduct = req.params.slugProduct;
    // socket comment product
    commentSocket(req, res);
    // end socket comment product

    const comments = await Comment.find({
        slugProduct: slugProduct,
        deleted: false
    }).sort({ createdAt: -1 });

    for (const comment of comments) {
        const infoUser = await User.findOne({
            _id: comment.user_id,
        }).select("fullName");
        comment.infoUser = infoUser;
    }

    const find = {
        deleted: false,
        slug: req.params.slugProduct,
        status: "active"
    }

    const product = await Product.findOne(find);

    // Kiểm tra nếu sản phẩm không tồn tại hoặc bị null
    if (!product) {
        return res.render("client/pages/product/discontinued", {
            pageTitle: "Sản phẩm đã ngừng kinh doanh"
        });
    }

    // Tạo variants mặc định nếu chưa có
    if (!product.variants || product.variants.length === 0) {
        product.variants = [{
            color: product.color || 'Mặc định',
            memory: product.memory || 0,
            price: product.price,
            discountPercentage: product.discountPercentage,
            stock: product.stock,
            thumbnail: product.thumbnail
        }];
    }

    // 1. Mảng màu duy nhất
    const uniqueVariants = product.variants.reduce((acc, curr) => {
        if (!acc.find(v => v.color === curr.color)) {
        acc.push({ color: curr.color });
        }
        return acc;
    }, []);

    // 2. Mảng bộ nhớ duy nhất cho màu đầu tiên (mặc định chọn màu đầu)
    const firstColor = uniqueVariants[0].color;
    const uniqueMemories = product.variants
        .filter(v => v.color === firstColor)
        .reduce((acc, curr) => {
        if (!acc.includes(curr.memory)) acc.push(curr.memory);
        return acc;
        }, []);

    
    if (product.products_category_id) {
        const category = await ProductCategory.findOne({
            _id: product.products_category_id,
            status: "active",
            deleted: false
        });

        product.category = category.title;
    };

    product.newPrice = productHelper.priceNewProduct(product);

    res.render("client/pages/product/detail", {
        pageTitle: product.title,
        product,
        comments,
        uniqueVariants,
        uniqueMemories
    })
}

// [GET] products/:slugCategory
module.exports.category = async (req, res) => {
    //sort -select
    let sort = formSelectHelper(req);

    const category = await ProductCategory.findOne({
        slug: req.params.slugCategory,
        deleted: false,
        status: "active"
    });

    const listSubCategory = await productCategoryHelper.getSubCategory(category.id);

    const listSubCategoryId = listSubCategory.map(item => item.id);

    const products = await Product.find({
        products_category_id: { $in: [category.id, ...listSubCategoryId] },
        deleted: false
    }).sort(sort);

    const newProducts = productHelper.priceNewProducts(products);


    res.render("client/pages/product/index", {
        pageTitle: category.title,
        products: newProducts
    });
}