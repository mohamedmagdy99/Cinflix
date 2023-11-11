const users = require("../Model/userModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const customError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");
const sendEmail = require("./../Utils/email");
const Token = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const userNew = await users.create(req.body);
  const token = Token(userNew._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: userNew,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    const error = new customError(
      "Please enter an email and password to login!",
      400
    );
    return next(error);
  }
  const user = await users.findOne({ email }).select("+password");
  if (!user) {
    const error = new customError("Incorrect email", 400);
    return next(error);
  }
  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new customError("Incorrect password", 400);
    return next(error);
  }
  const token = Token(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
exports.protect = asyncErrorHandler(async (req, res, next) => {
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new customError("you are not logged in !", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  const user = await users.findById(decodedToken.id);
  if (!user) {
    return next(
      new customError("the user with given token does not exist", 401)
    );
  }
  if (await user.isPasswordChanged(decodedToken.iat)) {
    return next(new customError("Please login again!", 401));
  }
  req.user = user;
  next();
});
exports.restrict = (...role) => {
  return asyncErrorHandler(async (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new customError("you are not allowed to perform this action", 403)
      );
    }
    next();
  });
};
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await users.findOne({ email: req.body.email });
  if (!user) {
    const error = new customError(
      "there is no user with this email. please try again!",
      404
    );
    next(error);
  }
  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have received a password reset request. Please use the belwo link to reset your password \n\n ${resetUrl}\n\n this reset password link will only be valid for 10 minutes.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "password change request",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "password reset email sent to user",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new customError(
        "there was an error sending password reset email please try again later.",
        500
      )
    );
  }
});
exports.passwordReset = asyncErrorHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await users.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    const error = new customError("token is invalid or has expired!", 400);
    next(error);
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.save();
  const loginToken = Token(user._id);
  res.status(200).json({
    status: "success",
    token: loginToken,
  });
});
