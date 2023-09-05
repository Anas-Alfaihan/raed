import express from "express";
const router = express.Router();

import storeApi from "./store.router.js";
import packApi from "./packs.router.js";

router.use("/", storeApi);
router.use("/packs", packApi);

export default router;
