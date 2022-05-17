const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifytoken");
const Product = require("../models/Product");
const router = require("express").Router();

// Create product
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const product = await newProduct.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});
// Update product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete product
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Sản phẩm đã được xoá!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get product
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all product
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const qNew = req.query.new; // lấy sản phẩm mới
  const qCategories = req.query.category; // lấy sản phẩm theo loại (category là cái url)

  let products;

  try {
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategories) {
      products = await Product.find({
        categories: {
          $in: [qCategories],
        },
      });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
