const express = require("express");
const usersController = require("../Controllers/usersController");
const router = express.Router();
router.route("/signup").post(usersController.signup);
router.route("/login").post(usersController.login);
router.route("/forgotPassword").post(usersController.forgotPassword);
router.route("/resetPassword/:token").patch(usersController.passwordReset);
module.exports = router;
