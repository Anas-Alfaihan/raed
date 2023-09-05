import express from "express";
const router = express.Router();
import control from "../../controllers/Admin/packs.admin.controllers.js";
import { schema } from "../../validation/Schema/packs.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";

///! validate is not work
//create
router.post(
    "/create",
    auth,
    // access(permissions.packs.create),
    validate(schema.body, type.body),
    control.create
);

//update
router.put(
    "/update/:id",
    auth,
    // access(permissions.packs.update),
    validate(schema.params, type.params), //validate params
    validate(schema.body, type.body), //validate body (name)
    control.update
);

router.delete(
    "/delete/:id",
    auth,
    // access(permissions.packs.delete),
    validate(schema.params, type.params), //validate params
    control.remove
);

router.get(
    "/all",
    auth,
    // access(permissions.packs.getAllPacks),
    control.getAllPacks
);
router.get(
    "/chartPack",
    auth,
    // access(permissions.packs.getAllPacks),
    control.chartPack
);
export default router;
