import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import expressSanitizer from "express-sanitizer";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { cache } from "./middleware/cache.js";
import badInputConfig from "./config/badInput.js";
import logRegisterConfig from "./config/log.js";
import corsConfig from "./config/cors.js";
import router from "./routers/router.js";
import createDatabase from "./utils/createDatabase.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { limiter } from "./middleware/limiter.js";
import compression from "compression";
const app = express();
// app.use(cache);/
dotenv.config({ path: `./.env` });
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "5mb" }));
// for upload image
app.use("/images", express.static(path.join(path.resolve(), "images")));
app.use(expressSanitizer());
app.use(express.json());

badInputConfig(app);
logRegisterConfig(app);
//corsConfig
corsConfig(app);
// helps in securing HTTP headers.s
app.use(helmet());
app.use(compression());
app.use(
    helmet.hsts({
        maxAge: 0,
    })
);

// create database if not exists
await createDatabase();
// to limiter requests from this IP
app.use(limiter);
//routers
app.use(router);

app.use(errorHandler);
export default app;
