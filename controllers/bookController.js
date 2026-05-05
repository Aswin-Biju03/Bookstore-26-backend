const books = require("../models/bookModel");

exports.addBookController = async (req, res) => {
  console.log("Inside addBookController");

  const {
    title,
    author,
    pages,
    imageURL,
    price,
    discountPrice,
    abstract,
    publisher,
    isbn,
    language,
    category,
  } = req.body;

  const uploadImages = req.files.map((item) => item.filename);

  const sellerMail = req.payload;

  console.log(
    title,
    author,
    pages,
    imageURL,
    price,
    discountPrice,
    abstract,
    publisher,
    isbn,
    language,
    category,
    uploadImages,
    sellerMail,
  );

  const existingBook = await books.findOne({ title, sellerMail });
  if (existingBook) {
    res.status(409).json("Book already Exists.... Operation Denied !!!");
  } else {
    const newBook = await books.create({
      title,
      author,
      pages,
      imageURL,
      price,
      discountPrice,
      abstract,
      publisher,
      isbn,
      language,
      category,
      uploadImages,
      sellerMail,
    });
    res.status(201).json(newBook);
  }
};

exports.getHomePageBookController = async (req, res) => {
  console.log("Inside getHomePageBookController");
  const homeBooks = await books.find().sort({ _id: -1 }).limit(4);
  res.status(200).json(homeBooks);
};

exports.getBooksPageController = async (req, res) => {
  console.log("Inside getBooksPageController");
  const loginUserMail = req.payload;
  const searchKey = req.query.search;
  const allBooks = await books.find({
    sellerMail: { $ne: loginUserMail },
    title: { $regex: searchKey, $options: "i" },
  });
  res.status(200).json(allBooks);
};

exports.getUserBooksController = async (req, res) => {
  console.log("Inside getUserBooksController");
  const loginUserMail = req.payload;
  const userBooks = await books.find({
    sellerMail: loginUserMail,
  });
  res.status(200).json(userBooks);
};

exports.getUserBoughtBookController = async (req, res) => {
  console.log("Inside getUserBoughtBookController");
  const loginUserMail = req.payload;
  const userBoughtBooks = await books.find({
    buyerMail: loginUserMail,
  });
  res.status(200).json(userBoughtBooks);
};

exports.getSingleBookController = async (req, res) => {
  console.log("Inside getSingleBookController");
  const { id } = req.params;
  const book = await books.findById(id);
  if (!book) {
    return res.status(404).json("Book not found");
  }

  res.status(200).json(book);
};

exports.removeUserUploadBooksController = async (req, res) => {
  console.log("Inside removeUserUploadBooksController");
  const loginUserMail = req.payload;
  const { id } = req.params;
  const removeBook = await books.findByIdAndDelete({ _id: id });
  res.status(200).json(removeBook);
};
