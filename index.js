const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("express-flash");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const { OpenAI } = require("openai");
const bodyParser = require("body-parser");
const database = require("./config/database");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const route = require("./routers/client/index.route");
const routerAdmin = require("./routers/admin/index.router");

const systemConfig = require("./config/system");

database.connect();

const app = express();

const port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(methodOverride("_method"));
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

app.use(express.static(`${__dirname}/public`));

// App Locals Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

// socket.io
const server = http.createServer(app);
const io = new Server(server);
global._io = io;

// Flash
app.use(cookieParser("HHSDHSDHHSH"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End Flash

//TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
//End TinyMCE

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// OpenAi
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

global._openai = openai;
//OpenAi

//Route
route(app);
//RouteAdmin
routerAdmin(app);

app.get("*", (req, res) => {
  res.render("client/pages/error/404", {
    pageTitle: "404 Not Found",
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
