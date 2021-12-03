const express = require("express");
const transactionsCtrl = require("../controllers/transaction");
const userAuth = require("../controllers/auth");

const router = express.Router();

router.use(userAuth.protect);
router.route("/").get(transactionsCtrl.getAllTransactions);
router.route("/me").get(transactionsCtrl.getMyWallet, transactionsCtrl.getMyTransactions);

module.exports = router;
