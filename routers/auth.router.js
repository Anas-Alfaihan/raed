import express from "express";
const router = express.Router();
import control from "../controllers/auth.controllers.js";
import { schema } from "../validation/Schema/auth.schema.js";
import { auth, validate, type } from "../config/header_routers.js";

/*
 * @auth controllers
 * public
 * @method POST
 * @work sign in as manger store
 */
router.post(
    "/signup-manger",
    validate(schema.signInManger, type.body),
    control.signUpManger
);

/*
 * @auth controllers
 * public
 * @method POST
 * @work sign in as user
 */
router.post(
    "/signup",
    validate(schema.signInUser, type.body),
    control.signUpUser
);

/*
 * @auth controllers
 * public
 * @method POST
 * @work login
 */
router.post("/login", validate(schema.logIn, type.body), control.login);

/*
 * @auth controllers
 * public
 * @method GET
 * @work logout
 */
router.get("/logout", auth, control.logout);

export default router;
