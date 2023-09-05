import express from "express";
const router = express.Router();
import control from "../../controllers/manager/packs.controller.js";
import { schema } from "../../validation/schema/manager/packs.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";

//get all packs to store
router.get(
    "/",
    auth,
    // access(permissions.store.getPacksStore),
    // lockRouter(permissions.ban_list.create),
    control.getPacks
);

//choose pack
router.put(
    "/choose",
    auth,
    // access(permissions.store.choosePackStore),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.choose, type.query),
    control.choosePack
);
//choose pack
router.put(
    "/update",
    auth,
    // access(permissions.store.choosePackStore),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.update, type.query),
    control.update
);
//packs
router.delete(
    "/delete/:id",
    auth,
    // access(permissions.store.deletePackStore),
    // lockRouter(permissions.ban_list.create),
    validate(schema.params, type.params),
    control.disablePack
);

export default router;
