const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const filterStatusHelper = require("../../helpers/filterStaus");
const formSearchHelper = require("../../helpers/formSearch");
const navigationHelper = require("../../helpers/navigation");
const configSystem = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

// [GET] admin/products
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);
  const formSearch = formSearchHelper(req.query);

  const find = {
    deleted: false,
  };
  if (req.query.status) {
    find.status = req.query.status;
  }

  if (formSearch.regex) {
    find.title = formSearch.regex;
  }

  //pagination
  const countPage = await Product.countDocuments(find);
  const objectPagination = navigationHelper(
    {
      currentPage: 1,
      limitProduct: 10,
    },
    req.query,
    countPage
  );
  //pagination

  //sort-select
  let sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }

  //sort-select
  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitProduct)
    .skip(objectPagination.indexProduct);

  for (const product of products) {
    // Lay ra thong tin nguoi tao
    const user = await Account.findOne({
      _id: product.createdBy.account_id,
    });

    if (user) {
      product.accountFullName = user.fullName;
    }

    // Lay ra thong tin nguoi cap nhat gan nhat
    const updatedBy = product.updatedBy[product.updatedBy.length - 1];
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id,
      });

      updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: formSearch.keyword,
    objectPagination: objectPagination,
  });
};

// [PATH] admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  await Product.updateOne(
    { _id: id },
    {
      status: status,
      $push: { updatedBy: updatedBy },
    }
  );

  req.flash("success", "Bạn đã cập nhật thành công");

  res.redirect("back");
};

// [PATH] admin/products/change/multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };
    switch (type) {
      case "active":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            status: "active",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash("success", "Bạn đã cập nhật thành công");
        break;
      case "inactive":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            status: "inactive",
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash("success", "Bạn đã cập nhật thành công");
        break;
      case "delete-all":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: "true",
            deletedAt: new Date(),
            $push: { updatedBy: updatedBy },
          }
        );
        req.flash("success", "Bạn đã xóa thành công");
        break;
      case "change-position":
        for (const item of ids) {
          let [id, position] = item.split("-");
          position = parseInt(position);
          await Product.updateOne(
            { _id: id },
            {
              position: position,
              $push: { updatedBy: updatedBy },
            }
          );
        }
        req.flash("success", "Bạn đã thay đổi thành công");
        break;
      default:
        break;
    }
    res.redirect("back");
  } catch (error) {
    res.redirect(`${configSystem.prefixAdmin}/products`);
  }
};

// [DELTE] admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  // await Product.deleteOne({_id: id});(Xoa cung , xoa vinh vien trong database);
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      // deletedAt: new Date()
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", "Bạn đã xóa thành công");
  res.redirect("back");
};

// [GET] admin/products/create
module.exports.createItem = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);

  // Thêm full_code vào dữ liệu để sử dụng trong frontend
  for (const record of records) {
    record.data_code = record.full_code;
  }

  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
    records: newRecords,
  });
};

// [POST] admin/products/create
module.exports.createPost = async (req, res) => {
  try {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.sold = 0;

    if (req.body.position == "") {
      const count = await Product.countDocuments();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    // Nếu không có mã sản phẩm, tạo mã ngẫu nhiên 4 ký tự
    if (!req.body.code || req.body.code.trim() === "") {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let isUnique = false;
      let code = '';
      
      // Tạo mã ngẫu nhiên cho đến khi tìm được mã duy nhất
      while (!isUnique) {
        code = '';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Tạo full_code từ mã
        let fullCode = code;
        if (req.body.products_category_id && req.body.products_category_id !== "") {
          const category = await ProductCategory.findById(req.body.products_category_id);
          if (category) {
            fullCode = category.full_code + code;
          }
        }
        
        // Kiểm tra tính duy nhất
        const existingProduct = await Product.findOne({ full_code: fullCode });
        if (!existingProduct) {
          isUnique = true;
          req.body.code = code;
        }
      }
    } else {
      // Xử lý mã sản phẩm
      req.body.code = req.body.code.toUpperCase().trim();
    }

    // Lấy mã danh mục từ category_id
    if (req.body.products_category_id && req.body.products_category_id !== "") {
      const category = await ProductCategory.findById(req.body.products_category_id);
      if (category) {
        req.body.full_code = category.full_code + req.body.code;
      } else {
        req.body.full_code = req.body.code;
      }
    } else {
      req.body.full_code = req.body.code;
    }

    // Kiểm tra một lần nữa tính duy nhất của full_code
    const existingProduct = await Product.findOne({ full_code: req.body.full_code });
    if (existingProduct) {
      req.flash('error', 'Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.');
      return res.redirect(`${configSystem.prefixAdmin}/products/create`);
    }

    // Xử lý biến thể (giả sử dữ liệu biến thể được gửi dưới dạng mảng)
    if (req.body.variantColors && req.body.variantMemories) {
      const colors = Array.isArray(req.body.variantColors) 
        ? req.body.variantColors 
        : [req.body.variantColors];
      const memories = Array.isArray(req.body.variantMemories) 
        ? req.body.variantMemories 
        : [req.body.variantMemories];
      const prices = Array.isArray(req.body.variantPrices) 
        ? req.body.variantPrices 
        : [req.body.variantPrices];
      const discounts = Array.isArray(req.body.variantDiscounts) 
        ? req.body.variantDiscounts 
        : [req.body.variantDiscounts];
      const stocks = Array.isArray(req.body.variantStocks) 
        ? req.body.variantStocks 
        : [req.body.variantStocks];
      
      req.body.variants = [];
      
      // Tạo các biến thể dựa trên dữ liệu nhập vào
      let index = 0;
      let minPrice = Number.MAX_VALUE;
      let totalStock = 0;
      
      // Thay thế 2 vòng for lồng nhau bằng 1 vòng for duy nhất:
      for (let idx = 0; idx < prices.length; idx++) {
        const price = parseInt(prices[idx] || 0);
        const stock = parseInt(stocks[idx] || 0);
        const discount = parseInt(discounts[idx] || 0);
        const color = colors[idx];
        const memory = parseInt(memories[idx]);

        req.body.variants.push({
          color,
          memory,
          price,
          discountPercentage: discount,
          stock,
          thumbnail: req.body.thumbnail
        });

        // Cập nhật giá thấp nhất
        if (price < minPrice && price > 0) minPrice = price;
        // Cộng dồn số lượng tồn kho
        totalStock += stock;
      }

      
      // Cập nhật giá và tồn kho của sản phẩm chính
      if (req.body.variants.length > 0) {
        req.body.price = minPrice !== Number.MAX_VALUE ? minPrice : 0;
        req.body.stock = totalStock;
        
        // Tính giá khuyến mãi trung bình (có thể điều chỉnh logic này)
        const totalDiscount = req.body.variants.reduce((sum, variant) => sum + variant.discountPercentage, 0);
        req.body.discountPercentage = Math.floor(totalDiscount / req.body.variants.length);
      }
    }

    req.body.createdBy = {
      account_id: res.locals.user.id,
    };

    const product = new Product(req.body);
    await product.save();
    req.flash('success', 'Bạn đã tạo sản phẩm thành công');
    res.redirect(`${configSystem.prefixAdmin}/products`);

  } catch (error) {
    console.error("Error creating product:", error);
    req.flash('error', 'Không thể tạo sản phẩm. Vui lòng kiểm tra thông tin và thử lại.');
    res.redirect(`${configSystem.prefixAdmin}/products/create`);
  }
};

// [GET] admin/products/edit/:id
module.exports.editGetItem = async (req, res) => {
  try {
    const id = req.params.id;
    const find = {
      deleted: false,
      _id: id,
    };

    const product = await Product.findOne(find);

    const records = await ProductCategory.find({ deleted: false });

    // Thêm full_code vào dữ liệu để sử dụng trong frontend
    for (const record of records) {
      record.data_code = record.full_code;
    }

    const newRecords = createTreeHelper.tree(records);
    res.render("admin/pages/products/edit", {
      pageTitle: "Trang chỉnh sửa sản phẩm",
      product: product,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`${configSystem.prefixAdmin}/products`);
  }
};

// [PATCH] admin/products/edit/:id
module.exports.editPatchItem = async (req, res) => {
  try {
    const id = req.params.id;
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    // Xử lý mã sản phẩm khi cập nhật
    req.body.code = req.body.code.toUpperCase().trim();
    
    // Lấy mã danh mục từ category_id
    if (req.body.products_category_id && req.body.products_category_id !== "") {
      const category = await ProductCategory.findById(req.body.products_category_id);
      if (category) {
        req.body.full_code = category.full_code + req.body.code;
      } else {
        req.body.full_code = req.body.code;
      }
    } else {
      req.body.full_code = req.body.code;
    }
    
    // Xử lý biến thể (giả sử dữ liệu biến thể được gửi dưới dạng mảng)
    if (req.body.variantColors && req.body.variantMemories) {
      const colors = Array.isArray(req.body.variantColors) 
        ? req.body.variantColors 
        : [req.body.variantColors];
      const memories = Array.isArray(req.body.variantMemories) 
        ? req.body.variantMemories 
        : [req.body.variantMemories];
      const prices = Array.isArray(req.body.variantPrices) 
        ? req.body.variantPrices 
        : [req.body.variantPrices];
      const discounts = Array.isArray(req.body.variantDiscounts) 
        ? req.body.variantDiscounts 
        : [req.body.variantDiscounts];
      const stocks = Array.isArray(req.body.variantStocks) 
        ? req.body.variantStocks 
        : [req.body.variantStocks];
      
      req.body.variants = [];
      
      // Tạo các biến thể dựa trên dữ liệu nhập vào
      let minPrice = Number.MAX_VALUE;
      let totalStock = 0;
      
      for (let idx = 0; idx < prices.length; idx++) {
        const price = parseInt(prices[idx] || 0);
        const stock = parseInt(stocks[idx] || 0);
        const discount = parseInt(discounts[idx] || 0);
        const color = colors[idx];
        const memory = parseInt(memories[idx]);

        req.body.variants.push({
          color,
          memory,
          price,
          discountPercentage: discount,
          stock,
          thumbnail: req.body.thumbnail
        });

        // Cập nhật giá thấp nhất
        if (price < minPrice && price > 0) minPrice = price;
        // Cộng dồn số lượng tồn kho
        totalStock += stock;
      }
      
      // Cập nhật giá và tồn kho của sản phẩm chính
      if (req.body.variants.length > 0) {
        req.body.price = minPrice !== Number.MAX_VALUE ? minPrice : 0;
        req.body.stock = totalStock;
        
        // Tính giá khuyến mãi trung bình
        const totalDiscount = req.body.variants.reduce((sum, variant) => sum + variant.discountPercentage, 0);
        req.body.discountPercentage = Math.floor(totalDiscount / req.body.variants.length);
      }
    }

    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Product.updateOne(
      { _id: id },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    req.flash("success", "Bạn đã thay đổi thành công !");
    res.redirect("back");
  } catch (error) {
    req.flash("error", "Cập nhật không thành công !");
    res.redirect("back");
  }
};

// [GET] admin/products/detail/:id
module.exports.detailItem = async (req, res) => {
  try {
    const id = req.params.id;
    const find = { deleted: false, _id: id };
    const product = await Product.findOne(find);

    // Nếu không có variants thì khởi tạo mặc định
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

    // Tạo mảng màu duy nhất
    const uniqueVariants = product.variants.reduce((acc, curr) => {
      if (!acc.find(v => v.color === curr.color)) {
        acc.push({ color: curr.color });
      }
      return acc;
    }, []);

    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product,
      uniqueVariants  // <-- truyền vào Pug
    });
  } catch (error) {
    res.redirect(`${configSystem.prefixAdmin}/products`);
  }
};


// [GET] admin/products/api/category/:id
module.exports.getCategoryCode = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await ProductCategory.findById(categoryId);
    
    if (category) {
      res.json({ full_code: category.full_code });
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// [GET] admin/products/api/check-code
module.exports.checkProductCode = async (req, res) => {
  try {
    const code = req.query.code ? req.query.code.toUpperCase().trim() : "";
    const categoryId = req.query.categoryId || "";
    
    // Nếu không có mã, trả về true để cho phép tiếp tục
    if (!code) {
      return res.json({ available: true });
    }
    
    let fullCode = code;
    
    // Nếu có category ID, lấy full_code của category
    if (categoryId) {
      const category = await ProductCategory.findById(categoryId);
      if (category) {
        fullCode = category.full_code + code;
      }
    }
    
    // Kiểm tra xem full_code đã tồn tại chưa
    const existingProduct = await Product.findOne({ full_code: fullCode });
    
    res.json({ 
      available: !existingProduct,
      fullCode: fullCode
    });
  } catch (error) {
    console.error("Error checking product code:", error);
    res.status(500).json({ error: "Server error", available: false });
  }
};

// [GET] admin/products/api/generate-code
module.exports.generateRandomCode = async (req, res) => {
  try {
    const generateUniqueCode = async () => {
      // Tạo mã ngẫu nhiên 4 ký tự
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      
      // Tạo mã 4 ký tự ngẫu nhiên
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Kiểm tra xem mã này đã tồn tại chưa
      const categoryId = req.query.categoryId || "";
      let fullCode = code;
      
      if (categoryId) {
        const category = await ProductCategory.findById(categoryId);
        if (category) {
          fullCode = category.full_code + code;
        }
      }
      
      const existingProduct = await Product.findOne({ full_code: fullCode });
      
      // Nếu đã tồn tại, tạo mã mới
      if (existingProduct) {
        return generateUniqueCode();
      }
      
      return code;
    };
    
    const uniqueCode = await generateUniqueCode();
    
    res.json({ code: uniqueCode });
  } catch (error) {
    console.error("Error generating random code:", error);
    res.status(500).json({ error: "Không thể tạo mã ngẫu nhiên" });
  }
};