const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifytoken");
const User = require("../models/User");
const router = require("express").Router();

// Update user
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_PASS).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete user
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("Người dùng đã được xoá!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get user
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...orders } = user._doc;

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all user
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const user = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get user stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
