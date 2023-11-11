const CustomError = require("./../Utils/CustomError");
const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong pls try again later!.",
    });
  }
};
const devError = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (err) => {
  const message = `Invalid value ${err.value} for field ${err.path}!`;
  return new CustomError(message, 400);
};
const duplicateErrorHandler = (err) => {
  const message = `Invalid duplicated value : ${err.keyValue.name} `;
  return new CustomError(message, 400);
};
const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data : ${errorMessages}`;
  return new CustomError(msg, 400);
};
const handleExpiredJWT = (err) => {
  return new CustomError("JWT token was expired. Please login again!", 401);
};
const webTokenError = (err) => {
  return new CustomError("Web token error. Please login again!", 401);
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    devError(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") {
      error = castErrorHandler(error);
    }
    if ((error.code = 11000)) {
      error = duplicateErrorHandler(error);
    }
    if (error.name === "ValidationError") {
      error = validationErrorHandler(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleExpiredJWT(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = webTokenError(error);
    }
    prodError(res, error);
  }
};
