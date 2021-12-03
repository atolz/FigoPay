const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Transaction must have a user"],
  },
  name: {
    type: String,
  },
  amount: {
    type: Number,
    default: 1000,
  },
  type: {
    type: String,
    default: "naira",
    enum: ["naira", "btc", "tron"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

WalletSchema.index({ user: 1, type: 1 }, { unique: true });

WalletSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "-__v" });
  next();
});

module.exports = mongoose.model("Wallet", WalletSchema);
