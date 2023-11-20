require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const urlRoutes = require("./routes/urlRoutes");
const redirectRoutes = require("./routes/redirectionRoutes");
const morgan = require('morgan');

const app = express();
app.use(express.json());

app.use(morgan('combined'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use("/user", userRoutes);
app.use("/url", urlRoutes);
app.use("/", redirectRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
