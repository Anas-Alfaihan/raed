import express from "express";
const router = express.Router();
import control from "../../controllers/Admin/home.admin.controller.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";
import { cache } from "../../middleware/cache.js";

//get all
router.get("/", auth, control.getCount);
router.get("/userChart", auth, control.userChart);
router.get("/storeChart", auth, control.storeChart);
router.get("/cityChart", auth, control.cityChart);
router.get(
    "/cartChart",
    auth,

    cache(300),
    control.cartChart
);
export default router;
