import express from "express";
const router = express.Router();

import authApi from "./auth.router.js";
import accountApi from "./account.router.js";
import userApi from "./users.router.js";
import storeApi from "./manager/router.js";
import adminApi from "./admin/index.js";
import devApi from "./dev.router.js";

router.use("/auth", authApi);
router.use("/account", accountApi);
router.use("/user", userApi);
router.use("/store", storeApi);
router.use("/admin", adminApi);
router.use("/dev", devApi);
router.use("/home", (req, res) => {
    res.status(200).send("welcome you in cheaper project ");
});
router.use("*", (req, res) => {
    res.status(404).send("Error 404 not found page ");
});
export default router;
