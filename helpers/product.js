module.exports.priceNewProducts = (products) => {
    const newProducts = products.map(item => {
        item.newPrice = Math.floor(item.price * (100 - item.discountPercentage) / 100);
        return item;
    });

    return newProducts;
};


module.exports.priceNewProduct = (product) => {
    const newPrice = (Math.floor(product.price * (100 - product.discountPercentage) / 100));

    return newPrice;
}