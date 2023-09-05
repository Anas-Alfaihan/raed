import express from "express";
const router = express.Router();
import control from "../controllers/users.controllers.js";
import { schema } from "../validation/schema/user.schema.js";
import { auth, validate, type, access } from "../config/header_routers.js";

router.get(
    "/home",
    auth,
    // access(),

    control.homePage
);

router.get(
    "/offer",
    auth,
    // access(),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.limited, type.query),
    control.allMyOffer
);

router.put(
    "/spam-evaluate",
    auth,
    // access(),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.type, type.query),
    validate(schema.body.spamEvaluation, type.body),
    control.spamEvaluation
);

router.get(
    "/choose-offer",
    auth,
    // access(),
    // lockRouter(permissions.ban_list.create),
    control.chooseOffer
);

router.put(
    "/gift",
    auth,
    // access(),
    validate(schema.query.gift, type.query),
    control.gift
);

router.get(
    "/evaluation/:id",
    auth,
    // access(),
    validate(schema.params.id, type.params),
    validate(schema.query.pagination, type.query),
    control.getEvaluateUser
);

export default router;
