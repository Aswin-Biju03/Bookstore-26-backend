const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
  console.log("Inside Admin Auth Middleware");
  const token = req.headers["authorization"].split(" ")[1];
  console.log(token);
  if (token) {
    try {
      const jwtResponse = jwt.verify(token, process.env.JWTSECRET);
      console.log(jwtResponse);
      req.payload = jwtResponse.userMail;
      const role = jwtResponse.role;
      if (role == "admin") {
        next();
      } else {
        res.status(401).json("Authorization Failed.... Unauthorised User !!!");
      }
    } catch (err) {
      res.status(401).json("Invalid Token.... Please Login !!!");
    }
  } else {
    res.status(401).json("Authorization Failed.... Token Missing !!!");
  }
};

module.exports = adminMiddleware;
