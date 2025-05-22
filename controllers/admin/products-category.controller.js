const ProductCategory = require("../../models/product-category.model");

const configSystem = require("../../config/system");

const createTreeHelper = require("../../helpers/createTree");


// [GET] admin/products-category
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords
    })
}

// [GET] admin/products-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);


    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo mới sản phẩm",
        records: newRecords
    })
}



// [GET] admin/products-category/api/check-code
module.exports.checkCategoryCode = async (req, res) => {
  try {
    const code = req.query.code ? req.query.code.toUpperCase().trim() : "";
    const parentId = req.query.parentId || "";
    
    // Nếu không có mã, trả về true để cho phép tiếp tục
    if (!code) {
      return res.json({ available: true });
    }
    
    let fullCode = code;
    
    // Nếu có parent ID, lấy full_code của danh mục cha
    if (parentId) {
      const parentCategory = await ProductCategory.findById(parentId);
      if (parentCategory) {
        fullCode = parentCategory.full_code + code;
      }
    }
    
    // Kiểm tra xem full_code đã tồn tại chưa
    const existingCategory = await ProductCategory.findOne({ full_code: fullCode });
    
    res.json({ 
      available: !existingCategory,
      fullCode: fullCode
    });
  } catch (error) {
    console.error("Error checking category code:", error);
    res.status(500).json({ error: "Server error", available: false });
  }
};



// [POST] admin/products-category/create
module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position == "") {
      const count = await ProductCategory.countDocuments();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    // Xử lý mã danh mục
    req.body.code = req.body.code.toUpperCase().trim();
    
    // Nếu có danh mục cha, lấy full_code từ danh mục cha
    if (req.body.paren_id && req.body.paren_id !== "") {
      const parentCategory = await ProductCategory.findById(req.body.paren_id);
      if (parentCategory) {
        req.body.full_code = parentCategory.full_code + req.body.code;
      } else {
        req.body.full_code = req.body.code;
      }
    } else {
      // Nếu không có danh mục cha, full_code = code
      req.body.full_code = req.body.code;
    }

    // Kiểm tra xem full_code đã tồn tại chưa
    const existingCategory = await ProductCategory.findOne({ full_code: req.body.full_code });
    if (existingCategory) {
      req.flash('error', 'Mã danh mục đã tồn tại. Vui lòng chọn mã khác.');
      return res.redirect(`${configSystem.prefixAdmin}/products-category/create`);
    }

    const record = new ProductCategory(req.body);
    await record.save();
    res.redirect(`${configSystem.prefixAdmin}/products-category`);
  } catch (error) {
    console.error("Error creating category:", error);
    req.flash('error', 'Không thể tạo danh mục. Vui lòng kiểm tra thông tin và thử lại.');
    res.redirect(`${configSystem.prefixAdmin}/products-category/create`);
  }
}

// [GET] admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false
        });

        const find = {
            deleted: false
        };

        const records = await ProductCategory.find(find);

        const newRecords = createTreeHelper.tree(records);


        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        })
    } catch (error) {
        res.redirect("back");
    }
}

// [PATCH] admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
    try {
        const id = req.params.id;
        req.body.position = parseInt(req.body.position);
        
        // Xử lý mã danh mục khi cập nhật
        req.body.code = req.body.code.toUpperCase().trim();
        
        // Nếu có danh mục cha, lấy full_code từ danh mục cha
        if (req.body.paren_id && req.body.paren_id !== "") {
            const parentCategory = await ProductCategory.findById(req.body.paren_id);
            if (parentCategory) {
                req.body.full_code = parentCategory.full_code + req.body.code;
            } else {
                req.body.full_code = req.body.code;
            }
        } else {
            // Nếu không có danh mục cha, full_code = code
            req.body.full_code = req.body.code;
        }

        // Cập nhật danh mục
        await ProductCategory.updateOne({ _id: id }, req.body);
        
        // Cập nhật lại full_code cho tất cả danh mục con
        await updateChildCategoriesCodes(id);
        
        req.flash('success', 'Bạn đã thay đổi thành công');
        res.redirect("back");

    } catch (error) {
        console.error("Error updating category:", error);
        req.flash('error', 'Cập nhật không thành công!');
        res.redirect("back");
    }
}

// Hàm hỗ trợ cập nhật mã cho các danh mục con
async function updateChildCategoriesCodes(parentId) {
    try {
        // Lấy thông tin danh mục cha
        const parentCategory = await ProductCategory.findById(parentId);
        if (!parentCategory) return;

        // Tìm tất cả danh mục con trực tiếp
        const childCategories = await ProductCategory.find({ 
            paren_id: parentId,
            deleted: false
        });

        // Cập nhật full_code cho từng danh mục con
        for (const child of childCategories) {
            const newFullCode = parentCategory.full_code + child.code;
            await ProductCategory.updateOne(
                { _id: child._id },
                { full_code: newFullCode }
            );
            
            // Đệ quy cập nhật cho các danh mục con của danh mục con hiện tại
            await updateChildCategoriesCodes(child._id);
        }
    } catch (error) {
        console.error("Error updating child categories:", error);
    }
}

exports.delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await ProductCategory.findByIdAndDelete(id);
      // Nếu bạn muốn redirect về danh sách sau xóa:
      return res.redirect("/admin/products-category");
      // Hoặc trả JSON:
      // return res.json({ success: true });
    } catch (err) {
      return next(err);
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