// importing express is returning a function
const express = require("express");
const moviesRouter = require("./Routes/moviesRoutes");
const usersRouter = require("./Routes/usersRoutes");
const morgan = require("morgan");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./Controllers/errorController");
// calling that function return an object
let app = express();
//we need to use a middleware to get the body of post request
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("./public"));
//custome middleware to execute functions in request , response cyclie
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});
app.use("/api/v1/movie", moviesRouter);
app.use("/api/v1/users", usersRouter);
app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server`,
    404
  );
  next(err);
});
app.use(globalErrorHandler);

module.exports = app;
