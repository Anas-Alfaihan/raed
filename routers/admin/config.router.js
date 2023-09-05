import express from "express";
const router = express.Router();
import control from "../../controllers/admin/config.controller.js";
import {
    auth,
    access,
    permissions,
    validate,
    type,
} from "../../config/header_routers.js";
import { schema } from "../../validation/schema/admin/config.schema.js";

router.put(
    "/update",
    auth,
    // access(),
    validate(schema.body, type.body),
    control.update
);

router.get(
    "/",
    auth,
    // access(),
    control.get
);

export default router;
