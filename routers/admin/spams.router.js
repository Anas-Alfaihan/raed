import express from 'express';
const router = express.Router();
import control from '../../controllers/Admin/spam.admin.controller.js';
import { schema } from '../../validation/schema/spams.schema.js';
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from '../../config/header_routers.js';
import { lockRouter } from '../../middleware/lockRouter.js';

router.get(
    '/spams-store',
    auth,
    // access(),
    validate(schema.body.get_spams, type.body),
    control.AllSpamsForStore
);

router.get(
    '/all',
    auth,
    // access(),
    control.AllStoreAndCount
);

export default router;
