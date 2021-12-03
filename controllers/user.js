const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");
const handlerFactory = require("./handlersFactory");

//set user id for the getuser, getOne factory handler
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

function filterObj(object, ...excludes) {
  excludes.forEach((el) => {
    delete object[el];
  });
  return object;
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined. Pls visit /signup",
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('multer file', req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("Pls visit the updatePassword route to update your password", 400));
  }
  // console.log(req.user.id);
  //vs; ...take note same ting from docucmet
  // console.log(req.user._id);

  const excludeUpdates = ["password", "passwordConfirm", "role", "changedPasswordAt", "photo"];
  console.log("Update Data.📃🪁🎯", req.body);
  // const test = {
  //   0: 'my value',
  // };
  // console.log(test[0]);

  const update = filterObj({ ...req.body }, ...excludeUpdates);

  if (req.file) {
    // console.log('req.file awailabel...', req.file);
    update.photo = req.file.filename;
  } else {
    // console.log('No req.file awailabel...🪁🎈🏀', req.file);
  }
  // console.log('Update Data.📃🪁🎯', update);

  const user = await User.findByIdAndUpdate(req.user.id, update, {
    runValidators: true,
    new: true,
  });
  if (req.file) await req.sharpInstance.toFile(`public/img/users/${req.file.filename}`);

  // if (req.file && req.file.sharp) {
  //   req.file.sharp.toFile(`public/img/users/${req.file.filename}`);
  // }

  // console.log('update', update);
  // console.log('body', req.body);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = handlerFactory.getOne(User, {
  path: "wallet",
  select: "-__v",
});

exports.getAllUsers = handlerFactory.getAll(User, {
  path: "wallet",
  select: "-__v",
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//Do not update with this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

// eslint-disable-next-line no-restricted-syntax
// for (const key in req.body) {
//   if (excludeUpdate.includes(key)) {
//     delete req.body[key];
//   }
// }

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const query = User.find();

//   const featuresApi = new APIFeatures(query, req.query)
//     .filter()
//     .sort()
//     .limitFields();

//   const users = await featuresApi.query;

//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });
