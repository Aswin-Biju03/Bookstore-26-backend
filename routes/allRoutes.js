const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const multerMiddleware = require("../middlewares/multerMiddleware");
const bookController = require("../controllers/bookController");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = new express.Router();

router.post("/register", userController.registerController);

router.post("/login", userController.loginController);

router.post("/google-login", userController.googleLoginController);

router.get("/home-books", bookController.getHomePageBookController);

router.get("/books/:id", bookController.getSingleBookController);

router.put(
  "/user/:id",
  authMiddleware,
  multerMiddleware.single("picture"),
  userController.userEditController,
);

router.post(
  "/books",
  authMiddleware,
  multerMiddleware.array("uploadImages", 3),
  bookController.addBookController,
);

router.get("/all-books", authMiddleware, bookController.getBooksPageController);

router.get(
  "/user-books",
  authMiddleware,
  bookController.getUserBooksController,
);

router.get(
  "/bought-books",
  authMiddleware,
  bookController.getUserBoughtBookController,
);

router.delete(
  "/books/:id",
  authMiddleware,
  bookController.removeUserUploadBooksController,
);

router.put(
  "/books/:id/buy",
  authMiddleware,
  bookController.bookPaymentController,
);

router.put(
  "/profile/:id",
  adminMiddleware,
  multerMiddleware.single("picture"),
  userController.userEditController,
);

router.get(
  "/payment-success",
  authMiddleware,
  bookController.paymentSuccessController,
);

router.post(
  "/books-ai",
  authMiddleware,
  bookController.generateBookDetailsAIController,
);

module.exports = router;
