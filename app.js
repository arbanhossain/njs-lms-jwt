const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const nunjucks = require("nunjucks");

const dotenv = require("dotenv");
dotenv.config();

const apiRoutes = require("./routes/apiRoutes");

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

app.get('/login', (req, res) => {
  res.render('login.html');
});

app.listen(process.env.PORT);
