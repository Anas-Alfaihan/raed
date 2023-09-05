import path from "path";
import { StatusCodes } from "http-status-codes";
import { Op, Sequelize } from "sequelize";
import _ from "lodash";
import fs from "fs";
// UTILS
import {
    removeFolder,
    sortAvatars,
    moveFile,
    convertToJpeg,
} from "../../utils/helper.js";

// MODELS
import {
    store,
    packsStore,
    user,
    packs,
    category,
    storeStory,
    offersUser,
} from "../../models/index.js";
import { verifyQROffer } from "../../utils/jwt.js";
import moment from "moment";
import { convertToWebp, removePic } from "../../utils/compressImage.js";

export default {
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    //this for create avatars store
    createStoreStory: async (req, store) => {
        //! should upload every image "storeStory"
        try {
            let storeStory = [];
            for (let i = 0; i < req.files.storeStory.length; i++)
                storeStory.push({
                    storeId: store.id,

                    avatar: req.files.storeStory[i].path,
                });
            // console.log(storeStory);
            //create all avatar store
            await storeStory.bulkCreate([...storeStory]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    update: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                attributes: ["id"],
                where: {
                    nameStore: req.body.nameStore.trim(),
                    userId: { [Op.ne]: req.user.id },
                },
                paranoid: false,
            });
            if (storeInfo)
                throw Error(
                    `اسم المتجر \'${req.body.nameStore.trim()}\' موجود بلفعل `
                );

            let categoryInfo = await category.findOne({
                attributes: ["id"],
                raw: true,
                where: { name: req.body.category.trim() },
            });
            if (!categoryInfo) throw Error("اسم الصنف  غير صحيح");

            storeInfo = await store.findOne({
                attributes: ["avatar"],
                raw: true,
                where: { userId: req.user.id },
            });
            let checkForDelete = false;
            let avatarLinks = {};
            if (
                req.file &&
                (JSON.parse(storeInfo.avatar) == "{}" ||
                    JSON.parse(storeInfo.avatar) != "{}")
            ) {
                let filenames = await convertToWebp(req.file.path, req);

                avatarLinks = filenames.map((filename) => {
                    return process.env.LINK + `/images/${filename}`;
                });
                // delete image recent
            } else if (!req.file && JSON.parse(storeInfo.avatar) != "{}") {
                checkForDelete = true;
            }
            await store.update(
                {
                    ...req.body,
                    avatar: JSON.stringify(avatarLinks),
                    categoryId: categoryInfo.id,
                },
                { where: { userId: req.user.id } }
            );
            res.status(StatusCodes.OK).json({
                success: true,
                msg: `تم التحديث بنجاح `,
            });

            if (req.file)
                removePic(req.file.path).then(async (e) => {
                    if (JSON.parse(storeInfo.avatar) != "{}") {
                        let avatars = JSON.parse(JSON.parse(storeInfo.avatar));

                        await Promise.all(
                            avatars.map(async (str) => {
                                let serverIndex = str.indexOf("/images/");
                                await removePic(
                                    path.join(
                                        path.resolve(),
                                        str.substring(serverIndex)
                                    )
                                );
                            })
                        );
                    }
                });
            else if (checkForDelete) {
                let avatars = JSON.parse(JSON.parse(storeInfo.avatar));
                await Promise.all(
                    avatars.map(async (str) => {
                        let serverIndex = str.indexOf("/images/");
                        await removePic(
                            path.join(
                                path.resolve(),
                                str.substring(serverIndex)
                            )
                        );
                    })
                );
            }
        } catch (error) {
            if (req.file) removePic(req.file.path);
            next(error);
        }
    },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    getAllInfo: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                raw: true,

                where: { userId: req.user.id },
                attributes: {
                    exclude: [
                        "showInBox",
                        "createdAt",
                        "updatedAt",
                        "categoryId",
                        "userId",
                    ],
                },
                include: [
                    {
                        model: category,
                        required: true,
                        attributes: ["name"],
                    },
                ],
            });
            let AllStory = await storeStory.findAll({
                where: { storeId: storeInfo.id },
                attributes: ["avatar"],
                raw: true,
            });

            storeInfo.storyStore = AllStory;

            res.status(StatusCodes.OK).json({
                success: true,
                data: storeInfo,
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    //! image avatar store
    uploadImage: async (req, res, next) => {
        try {
            if (!req.file) throw Error("لا يوجد صورة ");

            let storeInfo = await store.findOne({
                attributes: ["id", "avatar"],
                raw: true,
                where: { userId: req.user.id },
            });

            let filenames = await convertToWebp(req.file.path, req);

            let avatarLinks = filenames.map((filename) => {
                return process.env.LINK + `/images/${filename}`;
            });
            await store.update(
                { avatar: JSON.stringify(avatarLinks) },
                { where: { id: storeInfo.id } }
            );

            res.status(StatusCodes.OK).json({ success: true });

            removePic(req.file.path).then(async (e) => {
                if (JSON.parse(storeInfo.avatar) != "{}") {
                    let avatars = JSON.parse(JSON.parse(storeInfo.avatar));

                    await Promise.all(
                        avatars.map(async (str) => {
                            let serverIndex = str.indexOf("/images/");
                            await removePic(
                                path.join(
                                    path.resolve(),
                                    str.substring(serverIndex)
                                )
                            );
                        })
                    );
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    deleteImage: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                where: { userId: req.user.id },
                attributes: ["avatar", "id"],
                raw: true,
            });

            if (storeInfo.avatar == "{}") throw Error("لا يوجد صورة ");

            await store.update({ avatar: {} }, { where: { id: storeInfo.id } });

            if (storeInfo.avatar != "{}") {
                let avatars = JSON.parse(JSON.parse(storeInfo.avatar));

                avatars.map(async (str) => {
                    let serverIndex = str.indexOf("/images/");
                    await removePic(
                        path.join(path.resolve(), str.substring(serverIndex))
                    );
                });
            }
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },

    // !Story
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    uploadStory: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error("يجب ان يكون المتجر مقبول من قبل المدير");

            if (!req.file) throw Error("لا يوجد صورة ");

            let storeInfo = await store.findOne({
                where: { userId: req.user.id },
                attributes: ["id"],
                raw: true,
            });

            let allStory = await storeStory.findAll({
                raw: true,
                where: { storeId: storeInfo.id },
                attributes: ["id"],
            });
            if (allStory.length == 3)
                throw Error("لا يمكن ان يكون لديك اكثر من 3 صور ");

            let filenames = await convertToWebp(req.file.path, req);

            let avatarLinks = filenames.map((filename) => {
                return process.env.LINK + `/images/${filename}`;
            });

            await storeStory.create({
                avatar: JSON.stringify(avatarLinks),
                storeId: storeInfo.id,
            });
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الرفع بنجاح",
            });
            removePic(req.file.path);
        } catch (error) {
            if (req.file) removePic(req.file.path);
            next(error);
        }
    },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    deleteStory: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error("يجب ان يكون المتجر مقبول من قبل المدير");

            let deleteStory = await storeStory.findOne({
                attributes: ["avatar"],
                include: {
                    model: store,
                    required: true,
                    attributes: ["id"],
                    where: {
                        userId: req.user.id,
                        id: Sequelize.col("storeStory.storeId"),
                    },
                },
                where: { id: req.params.id },
            });

            if (!deleteStory) throw Error("رقم الصورة المطلوب غير صحيح");

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });

            await storeStory.destroy({
                where: { id: req.params.id },
                force: true,
            });

            if (JSON.parse(deleteStory.avatar) != "{}") {
                let avatars = JSON.parse(JSON.parse(deleteStory.avatar));

                await Promise.all(
                    avatars.map(async (str) => {
                        let serverIndex = str.indexOf("/images/");
                        await removePic(
                            path.join(
                                path.resolve(),
                                str.substring(serverIndex)
                            )
                        );
                    })
                );
            }
        } catch (error) {
            next(error);
        }
    },

    // /*
    //  * @employee
    //  * @private
    //  * @method POST
    //  * @work add new employee
    //  */
    // // get All image
    // getAllStory: async (req, res,next) => {
    //     try {
    //         let data = await storeStory.findAll({
    //             attributes: ["avatar", "id"],
    //             include: {
    //                 model: store,
    //                 attributes: [],
    //                 required: true,

    //                 where: { userId: req.user.id },
    //             },
    //         });

    //         res.status(StatusCodes.OK).json({ success: true, data });
    //     } catch (error) {
    //         res.status(StatusCodes.BAD_REQUEST).json({
    //             success: false,
    //             error: err.message,
    //         });
    //     }
    // },

    // /*
    //  * @employee
    //  * @private
    //  * @method POST
    //  * @work add new employee
    //  */

    // //delete image
    // deleteAllStory: async (req, res,next) => {
    //     try {
    //         let allStory = await storeStory.findAll({
    //             raw: true,
    //             attributes: ["avatar"],
    //             include: {
    //                 model: store,
    //                 required: true,

    //                 attributes: ["id"],
    //                 where: {
    //                     userId: req.user.id,
    //                     id: Sequelize.col("storeStory.storeId"),
    //                 },
    //             },
    //         });

    //         if (allStory.toString() == []) throw Error("لا يوجد صور لحذفها ");

    //         await storeStory.destroy({
    //             where: { storeId: allStory[0]["store.id"] },
    //         });

    //         allStory.forEach((e) => {
    //             removePic(e.avatar);
    //         });
    //         // console.log();
    //         res.status(StatusCodes.OK).json({
    //             success: true,
    //             msg: "تمت عملية الحذف بنجاح",
    //         });
    //     } catch (error) {
    //         res.status(StatusCodes.BAD_REQUEST).json({
    //             success: false,
    //             error: err.message,
    //         });
    //     }
    // },

    /*
    //  * @employee
    //  * @private
    //  * @method POST
    //  * @work add new employee
    //  */
    // //update Image Story mean update recent story
    // updateStory: async (req, res, next) => {
    //     try {
    //         if (!req.file) throw Error("لا يوجد صور ");
    //         //get store
    //         let store = await store.findOne({
    //             where: { userId: req.user.id },
    //             attributes: ["id"],
    //         });
    //         let image = await storeStory.findOne({
    //             attributes: ["avatar"],
    //             where: { storeId: store.id, id: req.params.id },
    //         });
    //         if (!image) throw Error("رقم الصورة المطلوب غير صحيح");

    //         let str = req.file.path;
    //         let serverIndex = str.indexOf("\\upload");
    //         if (serverIndex !== -1) req.file.path = str.substring(serverIndex);

    //         await storeStory.update(
    //             { avatar: req.file.path },
    //             { where: { storeId: store.id, id: req.params.id } }
    //         );
    //         let err = removePic(image.avatar);
    //         if (err) throw Error(err.message);
    //         res.status(StatusCodes.OK).json({
    //             success: true,
    //             msg: "تمت عملية التحديث بنجاح",
    //         });
    //     } catch (error) {
    //         if (req.file) removePic(req.file.path);

    //         res.status(StatusCodes.BAD_REQUEST).json({
    //             success: false,
    //             error: err.message,
    //         });
    //     }
    // },
    // /*
    //  * @employee
    //  * @private
    //  * @method POST
    //  * @work add new employee
    //  */
    // // get Special Story
    // getSpecialStory: async (req, res,next) => {
    //     try {
    //         let story = await storeStory.findOne({
    //             attributes: ["avatar", "id"],
    //             include: {
    //                 model: store,
    //                 required: true,

    //                 attributes: [],
    //                 where: {
    //                     userId: req.user.id,
    //                     id: Sequelize.col("storeStory.storeId"),
    //                 },
    //             },
    //             where: { id: req.params.id },
    //         });

    //         if (!story) throw Error("الصورة المطلوبة غير مودجودة");

    //         res.status(StatusCodes.OK).json({ success: true, data: story });
    //     } catch (error) {
    //         res.status(StatusCodes.BAD_REQUEST).json({
    //             success: false,
    //             error: err.message,
    //         });
    //     }
    // },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    verifyOffer: async (req, res, next) => {
        try {
            // for test
            // await offersUser.update(
            //     {
            //         QR: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsIm9mZmVySWQiOjgsInN0YXJ0VGltZSI6IjIwMjMtMDgtMjhUMTg6Mjc6MDkuMzQ4WiIsImV4cGlyZXNBdCI6IldlZG5lc2RheSBhdCA5OjI3IFBNIiwiaWF0IjoxNjkzMjQ3MjI5LCJleHAiOjE2OTM0MjAwMjl9.2E4pJ_Bo6UK-bR6Bm2lGslM3Kk6V9S1FWLMJV0lTX68",
            //     },
            //     { where: { userId: 5, id: 8 } }
            // );
            let info = verifyQROffer(req.query.qr.trim());

            let myOffer = await offersUser.findOne({
                attributes: ["dataTake", "createdAt"],
                paranoid: false,
                raw: true,
                where: {
                    id: info.offerId,
                    userId: info.userId,
                    QR: req.query.qr.trim(),
                },
            });
            if (!myOffer) throw Error("القيم المدخلة غير صحيحة");

            if (myOffer.dataTake) throw Error("العرض تم اخذه مسبقا");

            res.status(StatusCodes.OK).json({ success: true });

            offersUser.update(
                { QR: null, dataTake: moment() },
                { where: { id: info.offerId, userId: info.userId } }
            );
        } catch (error) {
            next(error);
        }
    },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    usersOfOffer: async (req, res, next) => {
        try {
            let myStore = await store.findOne({
                where: { userId: req.user.id },
                attributes: ["id"],
                raw: true,
            });
            let data = await offersUser.findAll({
                where: { offerId: req.params.id, dataTake: { [Op.not]: null } },
                paranoid: false,
                attributes: ["createdAt", "dataTake"],
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        attributes: [],
                        model: offer,
                        required: true,
                        where: { id: req.params.id, storeId: myStore.id },
                    },
                    {
                        model: user,
                        required: true,
                        attributes: ["name", "username", "avatar", "gender"],
                    },
                ],
            });
            res.status(StatusCodes.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
