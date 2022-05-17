const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_JWT, (err, user) => {
      if (err) res.status(401).json("Mã không hợp lệ");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("Bạn không được xác thực!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("Bạn không có đủ phân quyền!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("Bạn không có đủ phân quyền!");
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin };
