const Transaction = require("../models/transaction");
const handlerFactory = require("./handlersFactory");

exports.getAllTransactions = handlerFactory.getAll(Transaction, {
  path: "reciever sender",
  select: "-__v",
});

exports.getMyWallet = (req, res, next) => {
  req.trans = true;
  req.params.id = req.user.id;
  next();
};

exports.getMyTransactions = handlerFactory.getAll(Transaction, {
  path: "reciever ",
  select: "-__v",
});
