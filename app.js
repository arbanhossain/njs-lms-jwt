const express = require("express");
const path = require('path');
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");
const cors = require('cors');

const dotenv = require("dotenv");
dotenv.config();

const apiRoutes = require("./routes/apiRoutes");

const PORT = process.env.PORT

//MongoDB config
require("./loaders/db");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger("dev"));
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use("/api", apiRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT} | Environment: ${process.env.NODE_ENV}`)
});
