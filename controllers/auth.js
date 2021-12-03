const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("../utilities/appError");

const catchAsync = require("../utilities/catchAsync");

const User = require("../models/user");
const Wallet = require("../models/wallet");
const signJwt = require("../utilities/genJwt");

function sendToken(user, req, res, statusCode) {
  const token = signJwt(user._id);
  user.password = undefined;
  user.changedPasswordAt = undefined;
  // const userDetails = { ...user, ...wallet };
  // console.log(userDetails);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const newWallet = await Wallet.create({
    user: newUser._id,
  });
  console.log(newUser, newWallet);

  sendToken(newUser, req, res, 201);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  console.log("test....");
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  //check if user email exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password))) {
    return next(new AppError("email or password is invalid", 401));
  }

  //generate and send token
  sendToken(user, req, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check and find token
  // console.log(req.rateLimit);

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // console.log('token gotten from authorization Bearer');
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log("jwt....", token, req.headers.authorization.split(" ")[1]);

  if (!token) {
    return next(new AppError("Pls send a valid authorization token", 401));
  }

  console.log('before decode')
  //verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user with this token no longer exist", 401));
  }
  // console.log(currentUser.changedPasswordAt / 1000, decoded.iat);

  //check if the user has not changed his password recently
  // if (currentUser.hasChangedPassword(decoded.iat)) {
  //   return next(new AppError("You have updated your password, please login again", 401));
  // }
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) find user based on id
  const user = await User.findById(req.user._id).select("+password");

  // 2) check if password match
  if (!(await user.isCorrectPassword(req.body.password))) {
    return next(new AppError("Your current password is incorrect", 401));
  }

  // 3) if ok, change password and update at propertey
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in
  sendToken(user, req, res, 200);
});
