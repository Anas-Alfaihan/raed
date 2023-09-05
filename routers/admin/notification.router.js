import express from "express";
const router = express.Router();
import control from "../../controllers/Admin/notification.controller.js";
import { schema } from "../../validation/Schema/admin/notification.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";

router.post(
    "/send",
    auth,
    // access(permissions.packs.create),
    validate(schema.query.send, type.query),
    control.send
);

export default router;
