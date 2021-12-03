const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pls tell us your name"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Pls provide an Email address"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Pls provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Pls provide your password"],
      minlength: [6, "password must be atleast 6 characters long"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Pls confirm your password"],
      validate: {
        //only works for save and create: not findOneAndUpdate
        validator: function (pass) {
          return this.password === pass;
        },
        message: "Please confirm that password again",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('wallet', {
  ref: 'Wallet',
  foreignField: 'user',
  localField: '_id',
});

//HASH PASSWORD MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//PASSWORD CHANGED MIDDLEWARE
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.changedPasswordAt = Date.now() - 30 * 1000;
  // console.log(new Date().getSeconds());
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  this.populate("bookings");
  next();
});

userSchema.methods.isCorrectPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
