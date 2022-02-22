import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import postRoutes from "./routes/posts.js"; //middleware for importing routes
import userRoutes from "./routes/users.js";

// the normal way
// const express = require('express')

// The modern way, require modifying package file
// "type": "module" in package
const app = express();
dotenv.config(); // this makes env variables visible

// setting up server
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
// cors always go before routes
app.use("/posts", postRoutes); //adding posts prefix to all routes
app.use("/user", userRoutes);

app.use("/", (req, res) => {
  res.send("Hello to Triet's api");
});

// Connecting to data base
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }) //these options are optional but will cause error if not set
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => console.log(error));

// this is no longer needed
// mongoose.set("useFindAndModify", false);
