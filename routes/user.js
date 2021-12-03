const express = require("express");
const userAuth = require("../controllers/auth");
const userController = require("../controllers/user");

const router = express.Router();

router.route("/signup").post(userAuth.signUp);
router.route("/login").post(userAuth.logIn);
// router.route('/logout').get(userAuth.logOut);

router.use(userAuth.protect);
router.route("/").get(userController.getAllUsers);
router.get("/me", userController.getMe, userController.getUser);

module.exports = router;
