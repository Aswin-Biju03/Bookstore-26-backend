const mongoose = require("mongoose");
const connectionString = process.env.DBCONNECTIONSTRING;

mongoose
  .connect(connectionString)
  .then((res) => {
    console.log("Database Connected...");
  })
  .catch((error) => {
    console.log("Database connection Failed");
    console.log(error);
  });
