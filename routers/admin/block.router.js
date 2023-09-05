import express from "express";
const router = express.Router();
import control from "../../controllers/admin/block.admin.controller.js";
import { schema } from "../../validation/schema/block.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";
//create
router.post(
    "/create",
    auth,
    // access(permissions.ban_list.create),
    // lockRouter(permissions.ban_list.create),
    validate(schema.body.modify, type.body),
    control.create
);

//update
router.put(
    "/update/:id",
    auth,
    // access(permissions.ban_list.update),
    validate(schema.params, type.params),
    validate(schema.body.modify, type.body),
    control.update
);

router.delete(
    "/delete/:id",
    auth,
    // access(permissions.ban_list.delete),
    validate(schema.params, type.params),
    control.remove
);

router.get(
    "/all",
    auth,
    // access(permissions.ban_list.all),
    control.getAll
);
export default router;
