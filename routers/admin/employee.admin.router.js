import express from "express";
const router = express.Router();
import control from "../../controllers/admin/employee.admin.controller.js";
import { schema } from "../../validation/Schema/admin/employee.admin.schema.js";
import {
    auth,
    access,
    permissions,
    validate,
    type,
} from "../../config/header_routers.js";

router.post(
    "/create",
    auth,
    // access(permissions.admin.employee.add),
    validate(schema.body.modify, type.body),
    control.add
);

router.put(
    "/update/:id",
    auth,
    // access(permissions.admin.employee.update),
    // validate(schema.params, type.params),
    // validate(schema.body.modify, type.body),
    control.update
);

router.delete(
    "/delete/:id",
    auth,
    // access(permissions.admin.employee.delete),
    validate(schema.params, type.params),
    control.delete
);

router.get(
    "/all",
    auth,
    // access(permissions.admin.employee.all),
    control.getAll
);
export default router;
