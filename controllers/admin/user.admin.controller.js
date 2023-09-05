import { Op } from "sequelize";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import {
    role,
    store,
    user,
    category,
    storeStory,
    blockUser,
    offersUser,
    block,
    token,
    giftedOffers,
    packsStore,
} from "../../models/index.js";
import Sequelize from "sequelize";
import moment from "moment";
import {
    enumGender,
    enumTakenAddOfferOrNot,
    enumTypeOffer,
} from "../../utils/enums.js";
import controlUser from "../users.controllers.js";
import { removePic } from "../../utils/helper.js";
import { bcrypt } from "../../utils/bcrypt.js";
import path from "path";

import { mergedRecords } from "./category.admin.controller.js";
/*
///basic roles in system :
  1 Admin 
  2 User
  3 Manger saved
  4 Manger new 
  5 manger country 
#this roles can't any one edit or delete them 
#but other role can edit on it 
*/
export default {
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    statisticsInfo: async (req, res, next) => {
        try {
            let response = {};
            let userFound = await user.findOne({
                paranoid: false,
                raw: true,
                where: { roleId: 2 },
            });
            let genderStatistics = {};
            let countGender;
            //! Classification Gender
            if (userFound) {
                countGender = await user.findAll({
                    raw: true,
                    paranoid: false,
                    attributes: [
                        "gender",
                        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                    ],
                    group: "gender",
                    orderBy: "gender",
                    where: { roleId: 2 },
                });
                if (countGender.length == 1) {
                    if (countGender[0]["gender"] === enumGender.FEMALE) {
                        genderStatistics = {
                            female: countGender[0]["count"],
                            male: 0,
                        };
                    } else {
                        genderStatistics = {
                            female: 0,
                            male: countGender[0]["count"],
                        };
                    }
                } else if (countGender.length == 2) {
                    genderStatistics = {
                        female:
                            countGender[0]["gender"] == enumGender.FEMALE
                                ? countGender[0]["count"]
                                : countGender[1]["count"],
                        male:
                            countGender[1]["gender"] == enumGender.MALE
                                ? countGender[1]["count"]
                                : countGender[0]["count"],
                    };
                }
                genderStatistics = {
                    male:
                        (genderStatistics.male /
                            (genderStatistics.female + genderStatistics.male)) *
                        100,
                    female:
                        (genderStatistics.female /
                            (genderStatistics.female + genderStatistics.male)) *
                        100,
                };
            } else {
                genderStatistics = { male: 0, female: 0 };
            }
            //! ageWithCount
            let ageWithCount = await user.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [Sequelize.fn("YEAR", Sequelize.col("birthday")), "age"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                group: "age",
                paranoid: false,
                order: [[Sequelize.col("age", "ASC")]],
                where: { birthday: { [Op.not]: null }, roleId: 2 },
            });
            ageWithCount = ageWithCount.map((userInfo) => {
                return { ...userInfo, age: moment().year() - userInfo.age };
            });

            let counting = {
                under18: 0,
                between18And30: 0,
                between31And60: 0,
                more60: 0,
            };
            ageWithCount.forEach((ageInfo) => {
                if (ageInfo.age < 18) counting.under18 += ageInfo.count;
                else if (ageInfo.age >= 18 && ageInfo.age <= 30)
                    counting.between18And30 += ageInfo.count;
                else if (ageInfo.age > 30 && ageInfo.age <= 60)
                    counting.between18And30 += ageInfo.count;
                else counting.more60 += ageInfo.count;
            });

            //! countBlockUser
            let countBlockUser = await blockUser.findAndCountAll({
                raw: true,
                paranoid: false,
                attributes: ["id"],
                include: {
                    model: user,
                    paranoid: false,
                    required: true,
                    attributes: [],
                    where: { roleId: 2 },
                },
                where: { unblock_date: { [Op.is]: null } },
            });
            response = {
                countGender: genderStatistics,
                ageWithCount: counting,
                countBlockUser: countBlockUser.count,
            };
            res.status(StatusCodes.OK).json({ success: true, data: response });
        } catch (error) {
            res.status(StatusCodes.BAD_GATEWAY).json({
                success: false,
                error: error.message,
            });
        }
    },

    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    getUsers: async (req, res, next) => {
        try {
            const { page, size } = req.query;
            let allUser = await user.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                attributes: [
                    "id",
                    "name",
                    "username",
                    "phoneNumber",
                    "gender",
                    "avatar",
                    "birthday",
                ],
                where: { roleId: 2 },
            });

            let result = await Promise.all(
                allUser.map(async (userInfo) => {
                    let checkIfBlocked = (await blockUser.findOne({
                        raw: true,
                        attributes: ["id"],
                        paranoid: false,
                        where: { userId: userInfo.id },
                    }))
                        ? true
                        : false;

                    let dateLastOffer = await offersUser.findOne({
                        raw: true,
                        paranoid: false,
                        attributes: ["id", "createdAt"],
                        where: { userId: userInfo.id },
                    });
                    let active = false;
                    if (dateLastOffer) {
                        const now = moment();
                        const asDay = now.diff(
                            dateLastOffer.createdAt,
                            "day",
                            true
                        );
                        active = asDay < 7 ? true : false;
                    }
                    // console.log(userInfo, checkIfBlocked, active);
                    return {
                        userInfo,
                        checkIfBlocked,
                        active,
                    };
                })
            );

            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    getInformationUser: async (req, res, next) => {
        let countCart = async (checkIfTaken, discountType) => {
            let conditionTakenOrNot =
                checkIfTaken === "Taken"
                    ? { dataTake: { [Op.not]: null } }
                    : { dataTake: null };
            let conditionDiscount = discountType === "Free" ? "مجاني" : "مدفوع";

            let freeCartTaken = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("COUNT", Sequelize.col("offersUser.id")),
                        "count",
                    ],
                ],
                group: "userId", //index
                where: {
                    ...conditionTakenOrNot,
                    userId: req.params.id,
                    offerType: conditionDiscount,
                },
            });
            return freeCartTaken.length ? freeCartTaken[0].count : 0;
        };
        try {
            let response = {};
            let infoUser = await user.findOne({
                attributes: ["id"],
                paranoid: false,
                where: { id: req.params.id, roleId: 2 },
            });
            if (!infoUser) throw Error("المستخدم المحدد غير موجود");

            let allCategory = await infoUser.getCategories({
                raw: true,
                attributes: ["name", "emoji"],
            });
            allCategory = allCategory.map((categoryElement) => {
                return {
                    name: categoryElement.name,
                    emoji: categoryElement.emoji,
                };
            });
            let devices = await token.findAll({
                attributes: ["id", "browser", "system", "device", "logInDate"],
                raw: true,
                where: {
                    userId: req.params.id,
                },
            });

            // !!
            //!count Gift
            let countGift = await giftedOffers.findAll({
                raw: true,
                paranoid: false,

                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                group: "senderId",
                where: { senderId: req.params.id },
            });

            //! count
            let countFreeTaken = await countCart("Taken", "Free");
            let countFreeNotTaken = await countCart("notTaken", "Free");
            let countProTaken = await countCart("Taken", "Pro");
            let countProNotTaken = await countCart("notTaken", "Pro");

            //! countToGetGift
            let countToGetGift = await offersUser.findAll({
                raw: true,
                paranoid: false,

                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                group: "userId", //index
                where: {
                    takenGift: enumTakenAddOfferOrNot.notTaken,
                    userId: req.params.id,
                },
            });
            let countYourGift = countToGetGift.length
                ? Math.floor(countToGetGift[0].count / setting.GiftCard)
                : 0;

            let countToGet = countToGetGift.length
                ? setting.GiftCard -
                  (countToGetGift[0].count % setting.GiftCard)
                : 5;

            //! response
            response = {
                // العدد الهدايا التي قام ب اهدائها
                countGiftedForOtherUser: countGift.length
                    ? countGift[0].count
                    : 0,
                // عدد البطاقات التي سيتيم فتحها لنيل هدية اخرى
                stillToGetGift: countToGet,
                // عدد الهدايا التي يمتلكها حاليا والتي لم يفتحها الى الان
                // هي مشان مثلا فتح 10 صناديق ف بهل الحالة هوي عندو هديتين وليست وحدة ف بضلو بيطلعلو انو في هدية لم يتم فتحها الى الان لحى يفحها

                countYourGift: countYourGift > 0 ? countYourGift : 0,
                free: {
                    taken: countFreeTaken,
                    notTaken: countFreeNotTaken,
                },
                pro: {
                    taken: countProTaken,
                    notTaken: countProNotTaken,
                },
                category: allCategory,
                devices,
            };
            // !!
            res.status(StatusCodes.OK).json({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    },

    getChartForUser: async (req, res, next) => {
        try {
            let infoUser = await user.findOne({
                attributes: ["id"],
                paranoid: false,
                where: { id: req.params.id, roleId: 2 },
            });
            if (!infoUser) throw Error("المستخدم المحدد غير موجود");

            // CHART OFFER TAKEN
            let chartOfferTaken = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn(
                            "year",
                            Sequelize.col("offersUser.createdAt")
                        ),
                        "year",
                    ],
                    [
                        Sequelize.fn(
                            "MONTH",
                            Sequelize.col("offersUser.createdAt")
                        ),
                        "month",
                    ],

                    [
                        Sequelize.fn("COUNT", Sequelize.col("offersUser.id")),
                        "count",
                    ],
                ],

                where: { dataTake: { [Op.not]: null }, userId: req.params.id },
                group: ["year", "month"],
            });

            // CHART OFFER Not TAKEN
            let chartOfferNotTaken = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn(
                            "year",
                            Sequelize.col("offersUser.createdAt")
                        ),
                        "year",
                    ],
                    [
                        Sequelize.fn(
                            "MONTH",
                            Sequelize.col("offersUser.createdAt")
                        ),
                        "month",
                    ],

                    [
                        Sequelize.fn("COUNT", Sequelize.col("offersUser.id")),
                        "count",
                    ],
                ],
                where: { dataTake: null, userId: req.params.id },
                group: ["year", "month"],
            });

            let data = mergedRecords(chartOfferTaken, chartOfferNotTaken);

            res.status(StatusCodes.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    },
    getOfferForUser: async (req, res, next) => {
        try {
            if (
                !(await user.findOne({
                    raw: true,
                    attributes: ["id"],
                    paranoid: false,
                    where: { id: +req.query.userId, roleId: 2 },
                }))
            )
                throw Error("المستخدم غير موجود");

            const { page, size, search, type, statePaid } = req.query;

            let conditionPaid = {};
            if (statePaid === enumTakenAddOfferOrNot.taken)
                conditionPaid = { dataTake: { [Op.not]: null } };
            else if (statePaid === enumTakenAddOfferOrNot.notTaken)
                conditionPaid = { dataTake: null };

            let conditionTypeOffer = {};
            if (type === enumTypeOffer.free)
                conditionTypeOffer = { offerType: enumTypeOffer.free };
            else if (type === enumTypeOffer.paid)
                conditionTypeOffer = { offerType: enumTypeOffer.paid };

            let conditionSearch = {};
            if (search)
                conditionSearch = {
                    nameStore: { [Op.like]: `%${search}%` },
                };

            let result = await offersUser.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                attributes: [
                    "id",
                    "createdAt",
                    "discount",
                    "dataTake",
                    "offerType",
                ],
                include: {
                    model: packsStore,
                    required: true,
                    paranoid: false,
                    attributes: [],
                    include: {
                        model: store,
                        required: true,
                        paranoid: false,
                        attributes: ["nameStore", "avatar"],
                        where: {
                            ...conditionSearch,
                        },
                    },
                },

                where: {
                    ...conditionPaid,
                    ...conditionTypeOffer,
                    userId: +req.query.userId,
                },
            });

            result = result.map((offer) => {
                return {
                    id: offer.id,
                    createdAt: offer.createdAt,
                    discount: offer.discount,
                    dataTake: offer.dataTake,
                    offerType: offer.offerType,
                    nameStore: offer["packsStore.store.nameStore"],
                    avatar: offer["packsStore.store.avatar"],
                };
            });
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    getInfoStoreForOfferUser: async (req, res, next) => {
        try {
            if (
                !(await user.findOne({
                    raw: true,
                    attributes: ["id"],
                    paranoid: false,
                    where: { id: +req.query.userId, roleId: 2 },
                }))
            )
                throw Error("المستخدم غير موجود");

            let storeInfo = await offersUser.findOne({
                raw: true,
                attributes: ["evaluate", "reasonSpam"],
                paranoid: false,
                include: {
                    model: packsStore,
                    required: true,
                    paranoid: false,
                    attributes: [],
                    include: {
                        model: store,
                        paranoid: false,
                        required: true,
                        attributes: {
                            exclude: [
                                "requestDelete",
                                "categoryId",
                                "userId",
                                "showInBox",
                                "createdAt",
                                "updatedAt",
                            ],
                        },
                        include: {
                            model: category,
                            paranoid: false,
                            required: true,
                            attributes: ["name", "emoji"],
                        },
                    },
                },
                where: {
                    userId: +req.query.userId,
                    id: +req.query.id,
                },
                order: [["createdAt", "ASC"]],
            });
            storeInfo = {
                storeId: storeInfo["packsStore.store.id"],
                name: storeInfo["packsStore.store.nameStore"],
                avatar: storeInfo["packsStore.store.avatar"],
                fromHour: storeInfo["packsStore.store.fromHour"],
                toHour: storeInfo["packsStore.store.toHour"],
                locationText: storeInfo["packsStore.store.locationText"],
                longitude: storeInfo["packsStore.store.longitude"],
                latitude: storeInfo["packsStore.store.latitude"],
                city: storeInfo["packsStore.store.city"],
                deletedAt: storeInfo["packsStore.store.deletedAt"],
                category: {
                    name: storeInfo["packsStore.store.category.name"],
                    emoji: storeInfo["packsStore.store.category.emoji"],
                },
                evaluate: storeInfo.evaluate,
                reasonSpam: storeInfo.reasonSpam,
            };
            storeInfo.story = await storeStory.findAll({
                where: { storeId: storeInfo.storeId },
                raw: true,
                paranoid: false,
                attributes: ["avatar"],
            });

            res.status(StatusCodes.OK).json({ success: true, data: storeInfo });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    getUsersAndFilterAndSearch: async (req, res, next) => {
        try {
            const { page, size, gender, blocked, search, active } = req.query;

            let conditionGender = {};
            if (gender) conditionGender = { gender };
            let conditionSearch = {};
            if (search)
                conditionSearch = {
                    [Op.or]: [
                        { username: { [Op.like]: `%${search}%` } },
                        { name: { [Op.like]: `%${search}%` } },
                    ],
                };

            let conditionBlock = {};

            if (blocked != undefined && blocked == "true")
                conditionBlock = { unblock_date: { [Op.is]: null } };
            else if (blocked != undefined && blocked == "false")
                conditionBlock = { unblock_date: { [Op.not]: null } };

            let allUser = await user.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                attributes: [
                    "id",
                    "name",
                    "username",
                    "phoneNumber",
                    "gender",
                    "avatar",
                    "birthday",
                ],
                where: {
                    roleId: 2,
                    ...conditionGender,
                    ...conditionSearch,
                },
            });
            let result = await Promise.all(
                allUser.map(async (userInfo) => {
                    let checkIfBlocked = (await blockUser.findOne({
                        raw: true,
                        paranoid: false,
                        attributes: ["id"],
                        where: { userId: userInfo.id, ...conditionBlock },
                    }))
                        ? true
                        : false;

                    let dateLastOffer = await offersUser.findOne({
                        raw: true,
                        paranoid: false,
                        attributes: ["id", "createdAt"],
                        where: { userId: userInfo.id },
                    });
                    let isActive = false;
                    if (dateLastOffer) {
                        const now = moment();
                        const asDay = now.diff(
                            dateLastOffer.createdAt,
                            "day",
                            true
                        );
                        isActive = asDay < 7 ? true : false;
                    }

                    //this condition for  return value
                    if (conditionBlock.unblock_date) {
                        if (blocked == "true" && checkIfBlocked == true) {
                            if (active != null) {
                                if (active == "true" && isActive == true)
                                    return {
                                        userInfo,
                                        checkIfBlocked,
                                        active,
                                    };
                                else if (active == "false" && isActive == false)
                                    return {
                                        userInfo,
                                        checkIfBlocked,
                                        active,
                                    };
                            } else
                                return {
                                    userInfo,
                                    checkIfBlocked,
                                    active,
                                };
                        } else if (
                            blocked == "false" &&
                            checkIfBlocked == false
                        ) {
                            if (active != null) {
                                if (active == "true" && isActive == true)
                                    return {
                                        userInfo,
                                        checkIfBlocked,
                                        active,
                                    };
                                else if (active == "false" && isActive == false)
                                    return {
                                        userInfo,
                                        checkIfBlocked,
                                        active,
                                    };
                            } else
                                return {
                                    userInfo,
                                    checkIfBlocked,
                                    active,
                                };
                        }
                    } else {
                        if (active != null) {
                            if (active == "true" && isActive == true)
                                return {
                                    userInfo,
                                    checkIfBlocked,
                                    active,
                                };
                            else if (active == "false" && isActive == false)
                                return {
                                    userInfo,
                                    checkIfBlocked,
                                    active,
                                };
                        } else
                            return {
                                userInfo,
                                checkIfBlocked,
                                active,
                            };
                    }
                })
            );

            result = result.filter((e) => e !== undefined);
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    deleteUser: async (req, res, next) => {
        try {
            if (req.params.id === 1)
                throw Error("لا يمكنك اجراء عملية الحذف لمدير الموقع الاساسي");
            let destroyUser = await user.findOne({
                where: { id: req.params.id, roleId: 2 },
            });
            if (!destroyUser) throw Error("المستخدم المحدد غير موجودة");

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });
            await destroyUser.destroy({});
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    updateUser: async (req, res, next) => {
        try {
            if (req.params.id === 1)
                throw Error(
                    "لا يمكنك اجراء عملية التعديل لمدير الموقع الاساسي"
                );
            let updateUser = await user.findOne({
                attributes: ["id", "avatar"],
                where: { id: req.params.id, roleId: 2 },
            });
            if (!updateUser) throw Error("المستخدم المحدد غير موجودة");

            //check value
            let userInfo = await user.findOne({
                attributes: ["id", "avatar"],
                where: {
                    id: { [Op.ne]: updateUser.id },
                    username: req.body.username.trim(),
                },
                paranoid: false,
            });
            if (userInfo) throw Error("اسم المستخدم موجود مسبقاً");

            userInfo = null;

            //update interests
            let resultCheck = await controlUser.validationCategory(
                req,
                updateUser.id
            );
            if (resultCheck.error) throw Error(resultCheck.error);

            if (req.body.password !== "")
                userInfo = { ...req.body, password: bcrypt(req.body.password) };
            else userInfo = { ..._.omit(req.body, ["password"]) };

            // for image
            let avatarLink = null;
            if (req.file && updateUser.avatar) {
                // should update with new image
                avatarLink = process.env.LINK + `/images/${req.file.filename}`;

                // delete image recent
                let str = updateUser.avatar;
                let serverIndex = str.indexOf("/images/");
                removePic(
                    path.join(path.resolve(), str.substring(serverIndex))
                );
            } else if (req.file && !updateUser.avatar) {
                avatarLink = process.env.LINK + `/images/${req.file.filename}`;

                //should  store image
            } else if (!req.file && updateUser.avatar) {
                // delete image recent
                let str = updateUser.avatar;
                let serverIndex = str.indexOf("/images/");
                removePic(
                    path.join(path.resolve(), str.substring(serverIndex))
                );
                avatarLink = null;
            } else if (!req.file & !updateUser.avatar) {
                // don't do any things
                avatarLink = null;
            }

            await user.update(
                {
                    ...userInfo,
                    avatar: avatarLink,
                },
                { where: { id: updateUser.id } }
            );
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت العملية بنجاح",
            });
            resultCheck.array = resultCheck.array.map((e) => {
                return {
                    userId: updateUser.id,
                    categoryId: e.categoryId,
                };
            });
            await users_Pivot_category.bulkCreate([...resultCheck.array]);
        } catch (error) {
            next(error);
        }
    },

    // /*
    //  * @auth controllers
    //  * public
    //  * @method POST
    //  * @work sign in as manger store
    //  */
    // search: async (req, res,next) => {
    //     try {
    //         let myUser = await user.findOne({
    //             where: {
    //                 username: { [Op.like]: `%${req.body.username.trim()}%` },
    //             },
    //             attributes: { exclude: ["password"] },
    //             raw: true,
    //         });
    //         if (!myUser) throw Error("اسم المستخدم غير صحيح ");
    //         // console.log(myUser);
    //         let storeInfo = null;
    //         if (myUser.roleId == 3) {
    //             // console.log(1);
    //             storeInfo = await store.findOne({
    //                 attributes: { exclude: ["userId"] },
    //                 order: [["nameStore", "ASC"]],
    //                 where: { userId: myUser.id },
    //                 include: {
    //                     model: category,
    //                     attributes: ["name"],
    //                     required: true,
    //                 },
    //             });
    //         }

    //         res.status(StatusCodes.OK).json({
    //             success: true,
    //             data: myUser,
    //             storeInfo,
    //         });
    //     } catch (error) {
    //         res.status(StatusCodes.BAD_REQUEST).json({
    //             success: false,
    //             error: err.message,
    //         });
    //     }
    // },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    allBlockAboutUser: async (req, res, next) => {
        try {
            let response = {};
            let userCheck = await user.findOne({
                attributes: ["id"],
                raw: true,
                paranoid: false,
                where: { id: req.params.id },
            });
            if (!userCheck) throw Error("المستخدم المحدد غير موجود");

            let recordBlock = await blockUser.findAndCountAll({
                attributes: { exclude: ["userId", "blockId"] },
                paranoid: false,
                include: {
                    model: block,
                    paranoid: false,
                    required: true,
                    attributes: { exclude: ["id"] },
                },
                raw: true,
                where: { userId: req.params.id },
                paranoid: false,
            });

            let checkIfNowBlocked = recordBlock.rows.some(
                (record) => record.unblock_date == null
            );
            response = { ...recordBlock, checkIfNowBlocked };
            res.status(StatusCodes.OK).json({
                success: true,
                data: response,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */

    deleteBlockRecent: async (req, res, next) => {
        try {
            if (
                !(await user.findByPk(+req.query.userId, {
                    attributes: ["id"],
                    raw: true,
                }))
            )
                throw Error("المستخدم غير صحيح");

            let rightBlockId = await blockUser.findAll({
                attributes: ["blockId"],
                raw: true,
                paranoid: false,
                where: { userId: +req.query.userId },
            });
            rightBlockId = rightBlockId.map((blockInfo) => blockInfo.blockId);

            let ids = req.query.ids.map((id) =>
                rightBlockId.includes(+id) ? +id : false
            );
            let checkIfValidIds = ids.reduce(
                (firstId, secondId = true) => firstId && secondId
            );

            if (!checkIfValidIds)
                throw Error("بعض القيم انواع الحظر المدخلة غير موجودة");

            await blockUser.destroy({
                force: true,
                where: {
                    userId: +req.query.userId,
                    blockId: { [Op.in]: ids },
                },
            });
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت العملية بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    block: async (req, res, next) => {
        try {
            //! should to validation the show and action for right for user or this manger
            // هون بدي الواجها تل اقدر اعرف
            //like
            if (+req.query.userId === 1)
                throw Error("لا يمكن القيام بعملية الحظر لمدير الاساسي");
            let infoUser = await user.findByPk(+req.query.userId, {
                attributes: ["id", "roleId"],
                raw: true,
            });
            if (!infoUser) throw Error("المستخدم غير موجود");
            if (infoUser.roleId == 3 || infoUser.roleId == 4)
                throw Error("لا يمكنك القيام بعملية الحظر لمدير المحل");

            if (
                !(await block.findByPk(+req.query.blockId, {
                    attributes: ["id"],
                    raw: true,
                }))
            )
                throw Error("نوع الحظر غير صحيح");

            let blocked = await blockUser.findOne({
                attributes: ["id"],
                where: {
                    userId: +req.query.userId,
                    blockId: +req.query.blockId,
                },
            });
            if (blocked) throw Error(`هذا المستخدم محظور مسبقا`);

            await blockUser.create({
                userId: +req.query.userId,
                blockId: +req.query.blockId,
            });
            return res
                .status(StatusCodes.OK)
                .json({ success: true, msg: "تمت عملية الحظر بنجاح" });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    unBlockSelected: async (req, res, next) => {
        try {
            if (
                !(await user.findByPk(+req.query.userId, {
                    attributes: ["id"],
                }))
            )
                throw Error("المستخدم غير صحيح");

            let rightBlockId = await blockUser.findAll({
                attributes: ["blockId"],
                raw: true,
                where: { userId: +req.query.userId },
            });
            rightBlockId = rightBlockId.map((blockInfo) => blockInfo.blockId);

            // check if all ids in query is valid id or not

            let ids = req.query.ids.map((id) =>
                rightBlockId.includes(+id) ? +id : false
            );

            let checkIfValidIds = ids.reduce(
                (firstId, secondId = true) => firstId && secondId
            );

            if (!checkIfValidIds)
                throw Error("بعض القيم انواع الحظر المدخلة غير موجودة");

            await blockUser.destroy({
                where: {
                    userId: +req.query.userId,
                    blockId: { [Op.in]: ids },
                },
            });
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت لازالة بنجاح ",
            });
        } catch (error) {
            next(error);
        }
    },
};
