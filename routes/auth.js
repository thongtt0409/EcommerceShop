const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_PASS).toString(),
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  // findOne: Tìm thằng nào có username = value lúc đăng nhập nếu không có là null
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Sai Tên Đăng Nhập!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET_JWT,
      { expiresIn: "3d" }
    );

    const hasdPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_PASS);
    const originalPassword = hasdPassword.toString(CryptoJS.enc.Utf8);
    originalPassword !== req.body.password && res.status(401).json("Sai Mật Khẩu!");

    const { password, ...orders } = user._doc;

    res.status(200).json({ ...orders, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
