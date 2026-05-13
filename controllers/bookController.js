const books = require("../models/bookModel");
const stripe = require("stripe")(process.env.STRIPE_SK);
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

exports.paymentSuccessController = async (req, res) => {
  try {
    const { book_id } = req.query;
    const bookDetails = await books.findById(book_id);
    if (!bookDetails) return res.status(404).json("Book not found");
    bookDetails.status = "sold";
    await bookDetails.save();
    res.status(200).json("Payment confirmed");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookPaymentController = async (req, res) => {
  console.log("Inside bookPaymentController");

  try {
    const buyerMail = req.payload;
    const { id } = req.params;
    const bookDetails = await books.findById(id);

    if (!bookDetails) {
      return res.status(404).json("Book not found");
    }

    if (bookDetails.status === "sold") {
      return res.status(400).json("Book already sold");
    }

    const line_items = [
      {
        price_data: {
          currency: "inr", // ✅ change to inr since prices are in ₹
          product_data: {
            name: bookDetails.title,
            description: `${bookDetails.author}, ${bookDetails.publisher}`,
            // ✅ removed images (causes Stripe error with local filenames)
          },
          unit_amount: Math.round(bookDetails.discountPrice * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `http://localhost:5173/success?book_id=${id}`,
      cancel_url: "http://localhost:5173/cancel",
      line_items,
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        buyerMail,
        bookId: id,
      },
    });

    // ✅ mark as pending, not sold yet
    bookDetails.status = "pending";
    bookDetails.buyerMail = buyerMail;
    await bookDetails.save();

    res.status(200).json({ checkOutURL: session.url });
  } catch (error) {
    console.log("Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.generateBookDetailsAIController = async (req, res) => {
  console.log("Inside generateBookDetailsAIController");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const { title } = req.body;
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
  const result = await model.generateContent(`Give me a short abstract , author name of the book ${title} in json format`);
  const reply = result.response;
  console.log(reply);
  res.status(200).json({
    success: true,
    user: title,
    content: reply.candidates[0].content.parts[0].text,
  });
};
