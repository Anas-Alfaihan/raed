import express from "express";
const router = express.Router();
import control from "../controllers/account.controllers.js";
import { schema } from "../validation/schema/account.schema.js";
import {
    auth,
    access,
    permissions,
    validate,
    type,
} from "../config/header_routers.js";
import { uploadImage } from "../middleware/uploadImage.js";

router.get(
    "/profile",
    auth,
    // lockRouter(permissions.ban_list.create),

    control.getProfile
);
router.get(
    "/withdraw",
    auth,
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.limit, type.query),
    control.withdrawing
);
router.put(
    "/update",
    auth,
    // access(permissions.account.update),
    // lockRouter(permissions.ban_list.create),
    uploadImage("avatar", "single"),
    validate(schema.body.update, type.body),
    control.update
);

router.get(
    "/notification",
    auth,
    validate(schema.query.limit, type.query),
    control.getNotification
);

router.get("/myPermission", auth, control.myPermissionAndRestrictions);

/*
 * @account
 * @public
 * @method POST
 * @work change password
 */
router.put(
    "/ch-pass",
    auth,
    // access(permissions.account.changePassword),
    // lockRouter(permissions.ban_list.create),
    validate(schema.body.changePassword, type.body),
    control.changePassword
);
/*
 * @account
 * @public
 * @method POST
 * @work change phone number 1
 */
router.put(
    "/ch-phone",
    auth,
    // access(permissions.account.changePhone),
    // lockRouter(permissions.ban_list.create),
    validate(schema.body.ch_phon, type.body),
    control.changePhone
);

/*
 * @account
 * @public
 * @method POST
 * @work change email
 */

router.put(
    "/ch-email",
    auth,
    // access(permissions.account.changeEmail),
    // lockRouter(permissions.ban_list.create),
    validate(schema.body.ch_email, type.body),
    control.editEmail
);

router.get("/verify", auth, control.verify);
router.put("/resend", auth, control.resend);

router.put("/logoutDevice/:id", auth, control.logoutDevice);

export default router;

// /*

// router.delete(
//     '/remove',
//     auth,
//     // access(permissions.account.delete),
//     // lockRouter(permissions.ban_list.create),
//     control.remove
// );
// //! image
// /*
//  * @account
//  * @public
//  * @method POST
//  * @work upload Image
//  */
// router.post(
//     '/upload',
//     auth,
//     // access(permissions.account.uploadImage),
//     // lockRouter(permissions.ban_list.create),
//     uploadImage('image'),
//     control.uploadImage
// );

// /*
//  * @account
//  * @public
//  * @method POST
//  * @work delete Image
//  */
// router.delete(
//     '/delete-pic',
//     auth,
//     // access(permissions.account.deleteImage),
//     // lockRouter(permissions.ban_list.create),
//     control.deleteImage
// );

// /*
//  * @account
//  * @public
//  * @method POST
//  * @work get Image
//  */
// router.get(
//     '/pic',
//     auth,
//     // access(permissions.account.getImage),
//     // lockRouter(permissions.ban_list.create),
//     control.getImage
// );
