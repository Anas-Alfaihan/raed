import express from "express";
const router = express.Router();
import control from "../../controllers/manager/stores.controllers.js";
import { schema } from "../../validation/schema/manager/store.schema.js";
import {
    auth,
    access,
    permissions,
    type,
    validate,
} from "../../config/header_routers.js";
import { uploadImage } from "../../middleware/uploadImage.js";

//update
router.put(
    "/update",
    auth,
    // lockRouter(permissions.ban_list.create),
    uploadImage("avatar"),
    // access(permissions.store.update),
    validate(schema.body, type.body),
    control.update
);

// update;
router.get(
    "/",
    auth,
    // access(permissions.store.update),
    // lockRouter(permissions.ban_list.create),
    // validate(schema.body, type.body),
    control.getAllInfo
);

//! avatar store
//upload picture
router.post(
    "/upload",
    auth,
    // access(permissions.store.uploadImage),
    // lockRouter(permissions.ban_list.create),
    uploadImage("avatar"),
    control.uploadImage
);
//delete picture
router.delete(
    "/delete",
    auth,
    // access(permissions.store.deleteImage),
    // lockRouter(permissions.ban_list.create),
    control.deleteImage
);

// //get picture
// router.get(
//     "/pic",
//     auth,
//     // access(permissions.store.getImage),
//     // lockRouter(permissions.ban_list.create),
//     control.getImage
// );

//! story
//upload story
router.post(
    "/upload-story",
    auth,
    // access(permissions.store.uploadStory),
    // lockRouter(permissions.ban_list.create),
    uploadImage("avatar"),
    control.uploadStory
);
router.delete(
    "/delete-story/:id",
    auth,
    // access(permissions.store.deleteStory),
    // lockRouter(permissions.ban_list.create),
    control.deleteStory
);

// //update-story
// router.put(
//     "/update-story/:id",
//     auth,
//     // access(permissions.store.updateStory),
//     // lockRouter(permissions.ban_list.create),
//     uploadImage("update_story_store"),
//     ///!here should remove the recent image

//     control.updateStory
// );

// //all-story
// router.get(
//     "/all-story",
//     auth,
//     // access(permissions.store.getAllStory),
//     // lockRouter(permissions.ban_list.create),
//     control.getAllStory
// );
// //get-story
// router.get(
//     "/get-story/:id",
//     auth,
//     // access(permissions.store.getImagesStory),
//     // lockRouter(permissions.ban_list.create),
//     control.getSpecialStory
// );
//delete story

router.put(
    "/verify",
    auth,
    // access(permissions.store.deleteAllStory),
    // lockRouter(permissions.ban_list.create),
    validate(schema.query.verify, type.query),
    control.verifyOffer
);

router.get(
    "/users-offer/:id",
    auth,
    // access(permissions.store.deleteAllStory),
    // lockRouter(permissions.ban_list.create),
    // validate(schema.body.verify, type.body),
    control.usersOfOffer
);
export default router;
