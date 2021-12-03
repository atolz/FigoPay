const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");
const User = require("../models/user");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");
const handlerFactory = require("./handlersFactory");

exports.transfer = catchAsync(async (req, res, next) => {
  if (!req.body.password) {
    return next(new AppError("Your password is incorrect, pls provide a password to verify its you", 401));
  }

  const user = await User.findById(req.user._id).select("+password");

  // 2) check if password match
  if (!(await user.isCorrectPassword(req.body.password))) {
    return next(new AppError("Your password is incorrect", 401));
  }

  const sender = req.user;
  const receiverName = req.body.name;
  const amount = req.body.amount;
  const walletType = req.body.walletType;

  const senderWallet = await Wallet.findOne({ user: req.user._id, type: walletType });

  if (!senderWallet) {
    return next(new AppError("Couldn't find sender wallet. Pls make sure you have wallet type", 404));
  }

  if (senderWallet.amount < amount) {
    return next(new AppError("Insufficient balance in wallet", 401));
  }

  const reciever = await User.findOne({ name: receiverName });
  console.log(reciever);

  if (!reciever) {
    return next(new AppError("Couldn't find reciever", 404));
  }

  const recieverWallet = await Wallet.findOne({ user: reciever._id, type: walletType });

  console.log("reciever walllet", recieverWallet);

  if (!recieverWallet) {
    return next(new AppError("Couldn't find reciever wallet", 404));
  }

  console.log("reciever name", reciever.name, req.user.name);

  if (req.user.name == reciever.name) {
    return next(new AppError("You cannot send money to yourself", 401));
  }

  senderWallet.amount = parseInt(senderWallet.amount) - parseInt(amount);
  recieverWallet.amount = parseInt(recieverWallet.amount) + parseInt(amount);

  senderWallet.save();
  recieverWallet.save();

  console.log("senderWallet.amount ", senderWallet.amount);
  console.log("recieverWallet.amount ", recieverWallet.amount);

  console.log(senderWallet);

  await Transaction.create({ sender: req.user._id, reciever: reciever._id, amount: amount });

  // console.log("about to transfer.. to", receiver, " from ", sender.name, " amount::", amount);
  res.status(200).json({
    message: "success",
    userWallet: senderWallet,
  });
});

exports.addWalletDetails = (req, res, next) => {
  req.body.user = req.user.id;

  console.log("adding user details");

  next();
};

exports.getAllWallet = handlerFactory.getAll(Wallet);
exports.createWallet = handlerFactory.createOne(Wallet);
exports.updateWallet = handlerFactory.updateOne(Wallet);
exports.getWallet = handlerFactory.getOne(Wallet);

exports.removeWalletType = (req, res, next) => {
  console.log("befor removing walet type", req.body);
  if (req.body.type) {
    delete req.body["type"];
    console.log(req.body);
  }

  console.log("adding user details");

  next();
};
