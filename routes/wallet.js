const express = require("express");
const userAuth = require("../controllers/auth");
const walletCtrl = require("../controllers/wallet");

const router = express.Router();

router.use(userAuth.protect);

router.post("/transfer", walletCtrl.transfer);

router.route("/").get(walletCtrl.getAllWallet).post(walletCtrl.addWalletDetails, walletCtrl.createWallet);

router.route("/:id").get(walletCtrl.getWallet).patch(walletCtrl.removeWalletType, walletCtrl.updateWallet);

module.exports = router;
