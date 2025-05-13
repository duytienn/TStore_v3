const Product = require("../../models/product.model");
const productHelper = require("../../helpers/product");
const formSelectHelper = require("../../helpers/formSelect");
//[GET] /
module.exports.index = async (req, res) => {
  let sortSold = {
    sold: "desc",
  };
  // Lay ra san pham noi bat
  const productFeatured = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort(sortSold)
    .limit(4);

  const featuredProductIds = productFeatured.map((product) => product._id);
  await Product.updateMany(
    { _id: { $in: featuredProductIds } },
    { $set: { featured: "1" } }
  );

  await Product.updateMany(
    { _id: { $nin: featuredProductIds } },
    { $set: { featured: "0" } }
  );

  const newProducts = productHelper.priceNewProducts(productFeatured);

  // Lay ra san pham moi nhat

  //sort-select
  let sort = formSelectHelper(req);

  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort(sort)
    .limit(8);

  const newProductsNew = productHelper.priceNewProducts(productsNew);
  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productsFeatured: newProducts,
    productsNew: newProductsNew,
  });
};
