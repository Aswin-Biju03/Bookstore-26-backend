const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const multerMiddleware = require("../middlewares/multerMiddleware");

const router = new express.Router();

router.post("/register", userController.registerController);

router.post("/login", userController.loginController);

router.post("/google-login", userController.googleLoginController);

router.put(
  "/user/:id",
  authMiddleware,
  multerMiddleware.single("picture"),
  userController.userEditController,
);

module.exports = router;
