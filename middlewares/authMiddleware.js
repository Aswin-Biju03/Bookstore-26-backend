const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Inside Auth Middleware");
  const token = req.headers["authorization"].split(" ")[1];
  console.log(token);
  if (token) {
    try {
      const jwtResponse = jwt.verify(token, process.env.JWTSECRET);
      console.log(jwtResponse);
      req.payload = jwtResponse.userMail
      next()
    } catch (err) {
      res.status(401).json("Invalid Token.... Please Login !!!");
    }
  } else {
    res.status(401).json("Authorization Failed.... Token Missing !!!");
  }
};

module.exports = authMiddleware;
