const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
process.on("uncaghtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaght Exception occured! shutting down ...");
  process.exit(1);
});
const app = require("./app");
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    //console.log(conn);
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log(err);
  });
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log("server has started...");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection occured! shutting down ...");
  server.close(() => {
    process.exit(1);
  });
});
