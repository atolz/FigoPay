const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Transaction must have a sender"],
    },
    reciever: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Transaction must have a reciever"],
    },
    amount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// transactionSchema.virtual('sender', {
//   ref: 'User',
//   foreignField: '_id',
//   localField: 'sender',
// });

// transactionSchema.virtual('reciever', {
//   ref: 'User',
//   foreignField: '_id',
//   localField: 'reciever',
// });

module.exports = mongoose.model("Transaction", transactionSchema);
