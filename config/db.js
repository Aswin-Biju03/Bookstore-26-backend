const mongoose = require("mongoose");
const connectionString = process.env.DBCONNECTIONSTRING?.trim();

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database Connected...");
  })
  .catch((error) => {
    console.log("Database connection Failed");
    console.log(error);
  });