const path = require("path");

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/error");
const userRouter = require("./routes/user");
const transactionsRouter = require("./routes/transaction");
const walletRouter = require("./routes/wallet");

const app = express();
app.use(express.static(`${__dirname}/public`));

app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/petra/api/v1/users", userRouter);
app.use("/petra/api/v1/transactions", transactionsRouter);
app.use("/petra/api/v1/wallet", walletRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Url: ${req.originalUrl} was not found on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
