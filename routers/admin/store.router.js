import express from "express";
const router = express.Router();
import control from "../../controllers/Admin/store.admin.controller.js";
import { schema } from "../../validation/Schema/admin/store.admin.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";

// get all store with filter and search
router.get(
    "/all",
    auth,
    // access(permissions.store.all),
    validate(schema.query.all, type.query),
    control.getAllStore
);

// get all store
router.get(
    "/information/:id",
    auth,
    // access(permissions.store.all),
    validate(schema.params.idJust, type.params),
    control.getInformation
);

router.get(
    "/chart/:id",
    auth,
    // access(permissions.store.update),
    // lockRouter(permissions.ban_list.create),
    validate(schema.params.idJust, type.params),
    control.getChartStore
);

router.get(
    "/users",
    auth,
    // access(permissions.store.update),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.users, type.query),
    control.getUsersStore
);
router.get(
    "/packs/:id",
    auth,
    // access(permissions.store.update),
    // lockRouter(permissions.ban_list.create),
    validate(schema.params.idJust, type.params),
    control.getPacksStore
);
// get all store
router.get(
    "/evaluation",
    auth,
    // access(permissions.store.all),
    validate(schema.query.limit, type.query),
    control.getEvaluation
);

// get all store
router.delete(
    "/delete/:id",
    auth,
    // access(permissions.store.all),
    validate(schema.params.idJust, type.params),
    control.deleteStore
);

router.put(
    "/enable/:id",
    auth,
    // access(permissions.store.all),
    validate(schema.params.idJust, type.params),
    control.enable
);

router.put(
    "/block/:id",
    auth,
    // access(permissions.store.all),
    validate(schema.params.idJust, type.params),
    control.blockStore
);
router.put(
    "/unblock/:id",
    auth,
    // access(permissions.store.all),
    validate(schema.params.idJust, type.params),
    control.unblockStore
);
// get all store
router.put(
    "/accept",
    auth,
    // access(permissions.store.all),
    validate(schema.query.ids, type.query),
    control.acceptStores
);

router.get(
    "/all-block/:id",
    auth,
    validate(schema.params.idJust, type.params),
    control.allBlockRecordManger
);

export default router;
