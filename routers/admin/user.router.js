import express from "express";
const router = express.Router();
import control from "../../controllers/admin/user.admin.controller.js";
import { schema } from "../../validation/Schema/admin/user.admin.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";
import { uploadImage } from "../../middleware/uploadImage.js";

router.get(
    "/",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.query.filter, type.query),
    control.getUsersAndFilterAndSearch
);
router.get(
    "/information/:id",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.params.idJust, type.params),
    control.getInformationUser
);
router.get(
    "/chart-user/:id",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.params.idJust, type.params),
    control.getChartForUser
);
router.get(
    "/offer-user/:id",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.query.getOfferUser, type.query),
    control.getOfferForUser
);
router.get(
    "/info-storeOffer",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.query.storeInfoForOfferUser, type.query),
    control.getInfoStoreForOfferUser
);

router.put(
    "/update/:id",
    auth,
    // access(permissions.user.all),
    uploadImage("avatar", "single"),
    validate(schema.body.userInfo, type.body),
    validate(schema.params.idJust, type.params),
    control.updateUser
);

router.delete(
    "/delete/:id",
    auth,
    // access(permissions.user.all),
    validate(schema.params.idJust, type.params),
    control.deleteUser
);
router.get(
    "/statisticsInfo",
    auth,
    // access(permissions.store.all),

    control.statisticsInfo
);

// // !users
router.put(
    "/block",
    auth,
    // access(permissions.store.all),
    validate(schema.query.block, type.query),
    control.block
);
router.put(
    "/unblock",
    auth,
    // access(permissions.store.all),
    validate(schema.query.unblock, type.query),
    control.unBlockSelected
);
router.delete(
    "/deleteMultiBlock",
    auth,
    // access(permissions.store.all),
    validate(schema.query.unblock, type.query),
    control.deleteBlockRecent
);

router.get(
    "/allBlockUser/:id",
    auth,
    // access(permissions.store.all),
    // validate(schema.body, type.body),
    validate(schema.params.idJust, type.params),
    control.allBlockAboutUser
);

export default router;
