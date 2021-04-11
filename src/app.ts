import express, { NextFunction, Request, Response } from "express";
import friendsRoutesAuth from "./routes/friendRoutesAuth";
import dotenv from "dotenv";
import path from "path";
import { logger, winstonLogger, winstonCallBack } from "./middleware/logger";
import Cors from "cors";
import { ApiError } from "./errors/apierror";
const debug = require("debug")("app");
dotenv.config();

dotenv.config();
const app = express();

app.use(express.static(path.join(process.cwd(), "public")));
// Something has to go in here
app.use("/api/friends", Cors(), friendsRoutesAuth);

//logger
app.use(winstonCallBack);

// error handling
//app.use("/api", (req, res, next) => {
//res.status(404).json({ errorCode: 404, msg: "not found!!!!" });
//});
//SIMPLE LOGGER
//Please verify whether this works (requires app in your DEBUG variable, like DEBUG=www,app)
//If not replace with a console.log statement, or better the "advanced logger" refered to in the exercises
app.use((req, res, next) => {
  debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip);
  next();
});
//WINSTON/MORGAN-LOGGER (Use ONLY one of them)
// import logger, { stream } from "./middleware/logger";
// const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
// app.use(require("morgan")(morganFormat, { stream }));
app.set("logger", winstonLogger);
//The line above sets the logger as a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production

app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof ApiError) {
    if (err.errorCode != undefined)
      res.status(404).json({ errorCode: err.errorCode, msg: err.message });
  } else {
    next();
  }
});

app.get("/demo", (req, res) => {
  res.send("Hello World");
});

export default app;
