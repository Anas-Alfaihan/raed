import express from "express";
const router = express.Router();
import control from "../../controllers/Admin/category.admin.controller.js";
import { schema } from "../../validation/Schema/category.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { lockRouter } from "../../middleware/lockRouter.js";
import { cache } from "../../middleware/cache.js";
//create
router.post(
    "/create",
    auth,

    // access(permissions.category.create),
    validate(schema.body, type.body),
    control.create
);

//update
router.put(
    "/update/:id",
    auth,
    // access(permissions.category.update),

    validate(schema.params, type.params), //validate params
    validate(schema.body, type.body), //validate body (name)
    control.update
);

//remove
router.delete(
    "/delete/:id",
    auth,
    // access(permissions.category.delete),
    validate(schema.params, type.params), //validate params
    control.remove
);

//get all
router.get(
    "/all",
    // auth,
    // cache(process.env.DURATION),
    control.getAllCategory
);

router.get(
    "/chartForCategory",
    auth,
    // cache(process.env.DURATION),
    validate(schema.query.category, type.query),
    control.getChartForCategory
);

export default router;
