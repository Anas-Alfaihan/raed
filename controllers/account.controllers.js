import { StatusCodes } from "http-status-codes";
import moment from "moment";
import path from "path";
import { Op } from "sequelize";
import rand from "randomstring";
import _ from "lodash";

import useragent from "useragent";
import NodeCache from "node-cache";

// import sharp

//UTILS
import { compare } from "../utils/bcrypt.js";
import { moveFile, emailBody, convertToJpeg } from "../utils/helper.js";
import { sendCheck } from "../utils/nodemailer.js";
//MODELS
import {
    store,
    user as users,
    offersUser,
    packsStore,
    notification,
    blockUser,
    block,
    token,
    usersCategory,
    user,
} from "../models/index.js";
//CONTROLLER
import controlUser from "../controllers/users.controllers.js";
import { enumShowNotification, enumTypeOffer } from "../utils/enums.js";
import tokenTable from "../models/tokenTable.model.js";
import { convertToWebp, removePic } from "../utils/compressImage.js";

const myCache = new NodeCache();
// help function
//remove account manager
let removeManger = async (req, myIfoStore, b) => {
    try {
        let userOffers = await offersUser.findAll({
            raw: true,
            attributes: ["createdAt"],
            where: {
                dataTake: { [Op.not]: null },
            },
            include: {
                model: packsStore,
                required: true,
                attributes: [],
                include: {
                    model: store,
                    required: true,
                    attributes: [],
                    where: { id: myIfoStore.id },
                },
            },
        });

        const now = moment();

        let countOfCartNotTaken = userOffers.filter(
            (offerCart) => now.diff(offerCart.createdAt, "day", true) < 2
        ).length;

        //if not found date and found   any record  offer for user then execute this
        if (!myIfoStore.requestDelete && countOfCartNotTaken) {
            // manger myIfoStore first once to disable or delete  the myIfoStore , then not allow him to disable or delete before ended the all user offers taken
            myIfoStore.requestDelete = new Date();
            await myIfoStore.save();
            throw Error(
                "لا يمكنك ان تقوم بهذه العملية حتى يتم انتهاء جميع المستخدمين من استلام العروض او انتهاء مدة العرض علما انه من هذه اللحظة  ستيم ايقاف ظهور نسبة المحل ضمن الصناديق يمكنك اعادة الظهور من خلال زر الاعادة التفعيل"
            );
            //if found record offer for user not taken yet then execute this
        } else if (countOfCartNotTaken)
            throw Error(
                "لا يمكنك القيام بهذه العملية حتى يتم انتهاء فترة العروض او تسليم العروض لزبائن"
            );
        //if found date and not found any offer for user then execute this
        else {
            //here the manger is click disable after is not has any record  (getOffers_pivot_users)
            //! here should hooks before delete then delete every thing about this store
            await req.user.destroy({ force: true });
            //! should write in the hooks if before delete is soft delete then not delete but set disable,otherwise remove it
        }
        return true;
    } catch (error) {
        return { err: error.message };
    }
};

export default {
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */

    getProfile: async (req, res, next) => {
        try {
            let user = {};

            user.userInformation = _.omit(req.user.toJSON(), [
                "disableAt",
                "id",
                "roleId",
                "createdAt",
                "moreInfo",
                "password",
                "role",
            ]);
            user.userInformation.avatar = JSON.parse(
                user.userInformation.avatar
            );
            user.devices = await token.findAll({
                attributes: ["id", "browser", "system", "device", "logInDate"],
                raw: true,
                where: {
                    userId: req.user.id,
                },
            });
            user.block = await blockUser.findAll({
                attributes: ["block_date"],
                raw: true,
                where: { userId: req.user.id },
                include: {
                    model: block,
                    attributes: ["reason", "duration"],
                    required: true,
                },
            });
            if (req.user.role.id === 2) {
                // user
                let allCategory = await req.user.getCategories({
                    raw: true,
                    attributes: ["name", "emoji"],
                });
                user.userInformation.email = undefined;
                user.category = allCategory.map((categoryElement) => {
                    return {
                        name: categoryElement.name,
                        emoji: categoryElement.emoji,
                    };
                });
            }

            res.status(StatusCodes.OK).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },
    withdrawing: async (req, res, next) => {
        try {
            const { page, size } = req.query;
            if (req.user.roleId != 2)
                throw Error("يجب ان تكون مستخدم عادي فقط");
            let data = await offersUser.findAll({
                raw: true,
                limit: +size,
                offset: (+page - 1) * +size,
                attributes: ["createdAt", "cost"],
                where: { userId: req.user.id, offerType: enumTypeOffer.paid },
            });

            // هي الحركة لان بعض السجلات ممكن تكون عبارة عن هدية والهدية بتكون قيمة التكلفة فيها صفر ف مشان ما اعرضله انو هي التكلفة نسحب من حسابه وهي اساسا ما نسحب منه لذلك ساويت هي الخطوة
            data = data.map((item) => {
                if (item.cost !== 0) return item;
            });
            res.status(StatusCodes.OK).json({ success: true, data });
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
    update: async (req, res, next) => {
        try {
            if (req.role.id != 2 && req.body.category)
                throw Error("لا يمكنك ارسال الاهتمام لهذا النوع من الحساب");
            if (req.role.id == 2 && !req.body.category)
                throw Error("لا يمكنك ترك الاهتمامات فارغة");

            if (req.role.id === 2 && req.body.category.length < 3)
                throw Error("يجب ان يتم اختيار 3 اهتمامات على الاقل");

            let resultCheck = null;
            // validation the category if user
            if (req.role.id == 2) {
                resultCheck = await controlUser.validationCategory(
                    req.body.category,
                    req.user.id
                );
                if (resultCheck.error) throw Error(resultCheck.error);
            }

            //check value
            let user = await users.findOne({
                attributes: ["id", "avatar"],
                where: {
                    id: { [Op.ne]: req.user.id },
                    username: req.body.username.trim(),
                },
                paranoid: false,
            });
            if (user) throw Error("اسم المستخدم موجود سابقا");

            let checkForDelete = false;
            let avatarLinks = {};

            //? for image

            if (
                req.file &&
                (JSON.parse(req.user.avatar) == "{}" ||
                    JSON.parse(req.user.avatar) != "{}")
            ) {
                let filenames = await convertToWebp(req.file.path, req);

                avatarLinks = filenames.map((filename) => {
                    return process.env.LINK + `/images/${filename}`;
                });
                // delete image recent
            } else if (!req.file && JSON.parse(req.user.avatar) != "{}") {
                checkForDelete = true;
            }

            await users.update(
                { ...req.body, avatar: JSON.stringify(avatarLinks) },
                { where: { id: req.user.id } }
            );

            res.status(StatusCodes.OK).json({ success: true });

            if (req.role.id == 2) {
                await usersCategory.destroy({
                    where: { userId: req.user.id },
                });
                await usersCategory.bulkCreate([...resultCheck.array]);
            }

            if (req.file)
                removePic(req.file.path).then(async (e) => {
                    if (JSON.parse(req.user.avatar) != "{}") {
                        let avatars = JSON.parse(JSON.parse(req.user.avatar));
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
                let avatars = JSON.parse(JSON.parse(req.user.avatar));
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
    logoutDevice: async (req, res, next) => {
        try {
            let token = await tokenTable.findOne({
                attributes: ["id"],
                where: {
                    id: req.params.id,
                    userId: req.user.id,
                },
            });

            if (!token) throw Error("هذا الحساب مسجل خروج من هذا المتصفح");
            let agent = useragent.parse(req.headers["user-agent"]);

            let checkIfCurrentDevice = await tokenTable.findOne({
                attributes: ["id"],
                where: {
                    browser: agent.family,
                    device: agent.device.toString(),
                    userId: req.user.id,
                    id: req.params.id,
                },
            });
            if (checkIfCurrentDevice)
                throw Error("لا يمكنك تسجيل الخروج من الجهاز الحالي");

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تم تسجيل الخروج بنجاح ",
            });
            await token.destroy({});
        } catch (error) {
            next(error);
        }
    },

    /*
     * @account
     * @public
     * @method POST
     * @work change password
     */
    changePassword: async (req, res, next) => {
        try {
            if (req.body.password == req.body.newPassword)
                throw Error("الرجاء ادخال كلمة مرور مختلفة عن الكلمة السابقة ");

            //compare password
            const validPassword = await compare(
                req.body.password,
                req.user.password
            );
            // let agent = useragent.parse(req.headers["user-agent"]);

            if (!validPassword) {
                if (req.user.role.id != 2) {
                    let emailBody = `
                <h3>بعض الاجهوزة تحاول تغير كلمة المرور الخاص بك هل هو انت ام شخص اخر ؟ الرجاء القيام بتغير كلمة المرور لحماية الحساب الخاص بك </h3>
                <h3>تفاصيل الجهاز </h3>
                <h2>browser : ${agent.family}</h2><br>
                <h2>system : ${agent.os.toString()}</h2><br>
                <h2>device : ${agent.device.toString()}</h2><br>
                <h2>ip : ${req.ip.toString()}</h2><br>
                `;
                    await sendCheck(req.user.email, emailBody);
                }
                throw Error("كلمة المرور غير صحيحة ");
            }

            req.user.password = req.body.newPassword;
            await req.user.save();
            res.status(StatusCodes.OK).json({ success: true });
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
    changePhone: async (req, res, next) => {
        try {
            if (req.user.phoneNumber.trim() == req.body.phoneNumber.trim())
                throw Error("الرجاء ادخال رقم هاتف مختلف");

            let user = await user.findOne({
                attributes: ["id"],
                where: {
                    phoneNumber: req.body.phoneNumber.trim(),
                    id: { [Op.not]: req.user.id },
                },
            });

            if (user) throw Error("رقم الهاتف موجود لحساب اخر");

            req.user.phoneNumber = req.body.phoneNumber;
            await req.user.save();
            res.status(StatusCodes.OK).json({ success: true });
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
    editEmail: async (req, res, next) => {
        try {
            let additionalInformation = JSON.parse(
                JSON.parse(req.user.additionalInformation)
            );

            if (req.user.email === req.body.newEmail)
                throw Error(
                    "الايميل نفسه الايمل السابق الرجاء القيام ب اضافة ايميل مختلف"
                );
            const validPassword = await compare(
                req.body.password,
                req.user.password
            );

            if (!validPassword) {
                // let emailBody = `<h3>بعض الاجهوزة تحاول تغير الايميل الخاص بك هل هو انت ام شخص اخر ؟ الرجاء القيام بتغير كلمة المرور لحماية الحساب الخاص بك </h3>`;
                // await sendCheck(req.user.email, emailBody);

                throw Error("كلمة المرور غير صحيحة ");
            }

            const code = rand.generate({
                length: 6,
                charset: "numeric",
            });
            let link = `${process.env.LINK}/account/verify?code=${code}`;

            let body = emailBody(code, link);
            let result = await sendCheck(req.body.newEmail, body);
            if (result.error) throw Error(result.error);
            //set the value in cache with user ID
            myCache.set(
                req.user.id,
                JSON.stringify({
                    email: req.body.newEmail,
                    code,
                })
            );

            // console.log(additionalInformation);

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تم ارسال الرمز الى الايميل المدخل ",
            });

            await user.update(
                {
                    additionalInformation: JSON.stringify({
                        settings: additionalInformation["settings"],
                        accountCash: additionalInformation["accountCash"],
                        verify: {
                            email: false,
                            phone: additionalInformation.verify.phone,
                        },
                    }),
                },
                { where: { id: req.user.id } }
            );

            //use to remove the code from the cache after 10 minute
            setTimeout(() => {
                let result = myCache.get(req.user.id);

                if (result) myCache.del(req.user.id);
            }, 10 * 60 * 1000);
        } catch (error) {
            next(error);
        }
    },
    resend: async (req, res, next) => {
        try {
            let additionalInformation = JSON.parse(
                JSON.parse(req.user.additionalInformation)
            );
            if (additionalInformation.verify.email)
                throw Error("لقد تم تاكيد الايميل بشكل مسبق");

            let result = myCache.get(req.user.id);

            if (result) myCache.del(req.user.id);

            const code = rand.generate({
                length: 6,
                charset: "numeric",
            });
            let link = `${process.env.LINK}/account/verify?code=${code}`;

            let body = emailBody(code, link);
            result = await sendCheck(req.body.newEmail, body);
            if (result.error) throw Error(result.error);
            //set the value in cache with user ID
            myCache.set(
                req.user.id,
                JSON.stringify({
                    email: req.body.newEmail,
                    code,
                })
            );

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تم ارسال الرمز الى الايميل المدخل ",
            });
            //use to remove the code from the cache after 10 minute
            setTimeout(() => {
                let result = myCache.get(req.user.id);

                if (result) myCache.del(req.user.id);
            }, 10 * 60 * 1000);
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
    verify: async (req, res, next) => {
        try {
            let additionalInformation = JSON.parse(
                JSON.parse(req.user.additionalInformation)
            );
            if (additionalInformation.verify.email)
                throw Error("لقد تم تاكيد الايميل بشكل مسبق");

            let cahshMemory = myCache.get(req.user.id);
            if (!cahshMemory)
                throw Error(
                    "الرقم المدخل غير صحيح او انه انتهت المدة المسموحة الراجاء اعادة الضغط على اعادة ارسال الكود من جديد "
                );
            cahshMemory = JSON.parse(cahshMemory);

            if (cahshMemory.code !== req.query.code)
                throw Error("الرقم المدخل غير صحيح");

            myCache.del(req.user.id);

            await users.update(
                {
                    email: cahshMemory.email,
                    additionalInformation: JSON.stringify({
                        settings: additionalInformation.settings,
                        accountCash: additionalInformation.accountCash,
                        verify: {
                            email: true,
                            phone: additionalInformation.verify.phone,
                        },
                    }),
                },
                { where: { id: req.user.id } }
            );
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت تاكيد الايميل بنجاح",
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
    getNotification: async (req, res, next) => {
        try {
            let { page, size } = req.query;

            let data = await notification.findAll({
                attributes: { exclude: ["showType", "userId"] },
                raw: true,
                limit: +size,
                offset: (+page - 1) * +size,
                where: { userId: req.user.id },
            });

            res.status(StatusCodes.OK).json({
                success: true,
                data,
            });
            notification.update(
                { showType: enumShowNotification.SHOW },
                {
                    offset: (+page - 1) * +size,
                    limit: +size,
                    where: {
                        userId: req.user.id,
                    },
                }
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
    myPermissionAndRestrictions: async (req, res, next) => {
        try {
            let allPermision = {
                name: req.role.name,
                show: JSON.parse(JSON.parse(req.role.data)).show,
                action: JSON.parse(JSON.parse(req.role.data)).action,
            };
            let allRestrictions = await blockUser.findAll({
                raw: true,
                attributes: ["block_date"],
                include: {
                    model: block,
                    required: true,
                    attributes: ["reason", "duration", "restrictions"],
                },
                where: { userId: req.user.id },
            });

            res.status(StatusCodes.OK).json({
                success: true,
                data: { allPermision, allRestrictions },
            });
        } catch (error) {
            next(error);
        }
    },
};

//! account may be delete this router
//remove account
// remove: async (req, res,next) => {
//     // try {
//     //     if (req.user.id === 1)
//     //         throw Error(
//     //             'لا يمكنك حذف هذا الحساب بسب انه الحساب الرئيسي للمدير الموقع'
//     //         );
//     //     //! here should use hooks before delete the user delete every thing about user and before delete the manger store delete should delete store and offer and other things about this store

//     //     if (req.user.role.id === 3 || req.user.role.id === 4) {

//     //         let storeInfo = await store.findOne({
//     //             attributes:["stopShowInBox"],raw  :true,
//     //             where: { userId: req.user.id },
//     //         });
//     //         if(storeInfo)
//     //         {
//     //             if(storeInfo.stopShowInBox)
//     //         }
//     //         ///if manger store
//     //         let { err } = await removeManger(req, storeInfo, true);
//     //         if (err) throw Error(err);
//     //     } else {
//     //         //if is other user
//     //         await req.user.destroy({ force: true });
//     //     }
//     //     res.status(StatusCodes.OK).json({ success: true });
//     // } catch (error) {
//     //     res.status(StatusCodes.BAD_REQUEST).json({
//     //         success: false,
//     //         error: error.message,
//     //     });
//     // }
// }

// /*

//    /*
//      * @employee
//      * @private
//      * @method POST
//      * @work add new employee
//      */
//     // get image
//     getImage: async (req, res,next) => {
//         try {
//             return res
//                 .status(StatusCodes.OK)
//                 .json({ success: true, data: req.user.avatar });
//         } catch (error) {
//             return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .json({ success: false, error: err.message });
//         }
//     },
//     /*
//      * @employee
//      * @private
//      * @method POST
//      * @work add new employee
//      */
//     //delete image
//     deleteImage: async (req, res,next) => {
//         try {
//             if (!req.user.avatar) throw Error('لا يوجد صورة ');
//             await users.update(
//                 { avatar: null },
//                 { where: { id: req.user.id } }
//             );

//             let str = req.user.avatar;
//             let serverIndex = str.indexOf('/images/');
//             removePic(path.join(path.resolve(), str.substring(serverIndex)));

//             res.status(StatusCodes.OK).json({
//                 success: true,
//                 msg: 'تمت عملية الحذف بنجاح',
//             });
//         } catch (error) {
//             res.status(StatusCodes.BAD_REQUEST).json({
//                 success: false,
//                 error: err.message,
//             });
//         }
//     },
//       /*
//      * @employee
//      * @private
//      * @method POST
//      * @work add new employee
//      */
//     //! image
//     //upload image
//     uploadImage: async (req, res, next) => {
//         try {
//             let userInfoAvatar = await users.findOne({
//                 attributes: ['avatar'],
//                 raw: true,
//                 where: { id: req.user.id, avatar: { [Op.not]: null } },
//             });
//             if (!req.file) throw Error('لا يوجد صورة الرجاء اختيار صورة');

//             // if user has image before
//             if (userInfoAvatar) {
//                 let str = userInfoAvatar.avatar;
//                 let serverIndex = str.indexOf('/images/');
//                 removePic(
//                     path.join(path.resolve(), str.substring(serverIndex))
//                 );
//             }
//             let filename = null;

//             //! convert image to jpeg
//             // if (req.file.mimetype !== 'image/jpeg') {
//             //     filename = await convertToJpeg(req.file.path, req);
//             // } else filename = req.file.filename;

//             await users.update(
//                 { avatar: process.env.LINK + `/images/${req.file.filename}` },
//                 { where: { id: req.user.id } }
//             );
//             //remove the image from the folder
//             if (fs.existsSync(req.user.avatar)) removePic(req.user.avatar);
//             res.status(StatusCodes.OK).json({ success: true });
//         } catch (error) {
//             if (fs.existsSync(req.file)) removePic(req.file.path);
//             res.status(StatusCodes.BAD_REQUEST).json({
//                 success: false,
//                 error: err.message,
//             });
//         }
//     },
// */
