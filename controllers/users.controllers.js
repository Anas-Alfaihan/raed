import moment from "moment";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

//UTILS
import { createQROffer } from "../utils/jwt.js";
import { sequelize } from "../utils/connect.js";

//MODELS
import {
    store,
    user,
    offersUser,
    storeStory,
    category as Category,
    token as tokenTable,
    packsStore,
    notification,
    category,
    giftedOffers,
} from "../models/index.js";
import { Op, Sequelize } from "sequelize";
import {
    enumShowNotification,
    enumStateOffer,
    enumTakenAddOfferOrNot,
    enumTypeOffer,
} from "../utils/enums.js";
import { readSetting } from "../utils/helper.js";
import { response } from "express";
let setting = readSetting();
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
export default {
    chooseOffer: async (req, res, next) => {
        try {
            let dataToday = moment();
            let offerFound = await offersUser.findOne({
                where: { userId: req.user.id },
                attributes: ["id", "createdAt"],
                raw: true,
                paranoid: false,
            });

            if (offerFound && dataToday.diff(offerFound.createdAt, "days") < 1)
                throw Error("لا يمكنك اختيار اكثر من عرض بنفس اليوم ");
            /*----------------------------------------- */
            ///? choose random category
            let allCategory = await req.user.getCategories({
                raw: true,
                attributes: ["id", "name"],
            });
            let randomCategoryId =
                Math.floor(Math.random() * allCategory.length - 1) + 1;
            let myCategory = shuffleArray(allCategory)[randomCategoryId];
            // console.log(myCategory);
            /*----------------------------------------- */
            // for get the store id nearest user with random category
            let resultQuery = await sequelize.query(
                ` SELECT calculate_nearest_store_distance(${req.body.latitude},${req.body.longitude},${myCategory.name}) AS storeId`,
                {
                    type: sequelize.QueryTypes.RAW,
                    raw: true,
                }
            );
            let storeId = resultQuery[0][0].storeId;
            let storeInfo = await store.findOne({
                where: { id: storeId },
                attributes: {
                    exclude: [
                        "unavailableAt",
                        "categoryId",
                        "userId",
                        "requestDelete",
                    ],
                },
            });
            let storeOfStory = await storeStory.findAll({
                where: { storeId },
                attributes: ["avatar"],
            });
            // /*----------------------------------------- */
            // //? choose random offer in store
            let offers = await offer.findAll({
                where: { storeId: storeId },
                raw: true,
                attributes: ["id", "title", "description", "discount"],
            });
            let randomOfferId =
                Math.floor(Math.random() * offers.length - 1) + 1;
            let myOffer = shuffleArray(offers)[randomOfferId];
            // /*----------------------------------------- */
            // //?create token For QR Code
            let QR = createQROffer({
                offerId: myOffer.id,
                userId: req.user.id,
            });
            let offerCreated = await offersUser.create({
                offerId: myOffer.id,
                userId: req.user.id,
                QR,
            });
            res.status(StatusCodes.OK).json({
                success: true,
                data: {
                    offer: myOffer,
                    store: { storeInfo, storeOfStory },
                    duration: moment(offerCreated.createdAt)
                        .add(2, "days")
                        .format("YYYY-MM-DD hh:mm"),
                    category: myCategory.name,
                    QR,
                },
            });
        } catch (error) {
            res.status(StatusCodes.BAD_GATEWAY).json({
                success: false,
                error: error.message,
            });
        }
    },

    //! interests User
    validationCategory: async (values, userId) => {
        try {
            let allCategory = await Category.findAll({
                attributes: ["name", "id"],
                raw: true,
            });
            //we using "set" for unique value
            let category = new Set(values.map((e) => e.trim()));

            let array = [];
            let ans = [...category].every((e) =>
                allCategory.some((element) => {
                    if (e == element.name) {
                        array.push({ userId, categoryId: element.id });
                        return true;
                    } else return false;
                })
            );

            if (!ans)
                return {
                    error: "بعض القيم المدخل غير مطابقة للقيم الموجودة ضمن الاصناف الرجاء اعادة ادخال بشكل الصحيح",
                };

            return { success: true, array };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    getEvaluateUser: async (req, res, next) => {
        try {
            let offerInfo = await offersUser.findOne({
                attributes: ["id"],
                paranoid: false,
                raw: true,
                where: { id: req.params.id, userId: req.user.id },
            });
            if (!offerInfo)
                throw Error(
                    "لا يمكنك الحصول على التقيام الخاصة بهذا العرض , لا تملك هذا العرض"
                );

            const { page, size } = req.query;

            let allEvaluateUserPage = await offersUser.findAll({
                attributes: ["evaluate", "createdAt"],
                raw: true,
                limit: +size,
                paranoid: false,
                offset: (+page - 1) * +size,
                include: {
                    model: user,
                    required: true,
                    paranoid: false,
                    attributes: ["name", "username", "avatar"],
                },
                where: { id: req.params.id },
            });
            let data = allEvaluateUserPage.filter((item) => {
                if (item.evaluate !== null) return true;
            });

            res.status(StatusCodes.OK).json({
                success: true,
                data,
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
    gift: async (req, res, next) => {
        try {
            if (req.query.username === req.user.username)
                throw Error("لا يمكنك القيام بعملية الاهداء لنفسك");
            let offer = await offersUser.findOne({
                raw: true,
                paranoid: false,
                attributes: ["dataTake", "createdAt"],
                where: { userId: req.user.id, id: +req.query.offerId },
            });

            if (!offer) throw Error("لا تمتلك هذا العرض ل اهدائه");
            if (offer.dataTake)
                throw Error(
                    "لا يمكن اجراء عملية الاهداء بعد ان تمت اخذ العرض بنجاح"
                );
            if (moment(offer.createdAt).add(2, "day") < moment())
                throw Error(
                    "ان صلاحية العرض قد انتهت, لا يمكنك القيام ب اي عملية"
                );

            let receiverInfo = await user.findOne({
                attributes: ["id"],
                raw: true,
                paranoid: false,
                where: { username: req.query.username.trim(), roleId: 2 },
            });
            if (!receiverInfo) throw Error("اسم المستخدم غير صحيح");

            res.status(StatusCodes.OK).json({
                success: false,
                msg: "تمت عملية الاهداء بنجاح",
            });
            //   ! create new QR code
            let QR = createQROffer({
                id: offer.id,
                userId: receiverInfo.id,
            });

            offersUser.update(
                {
                    evaluate: null,
                    reasonSpam: null,
                    stateNotification: null,
                    takenGift: enumTakenAddOfferOrNot.notTaken,
                    cost: 0,
                    userId: receiverInfo.id,
                    QR,
                },
                {
                    where: {
                        id: +req.query.offerId,
                    },
                    paranoid: false,
                }
            );

            giftedOffers.create({
                senderId: req.user.id,
                receiverId: receiverInfo.id,
                offersUserId: +req.query.offerId,
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
    spamEvaluation: async (req, res, next) => {
        try {
            if (req.body.reasonSpam && req.body.evaluate)
                throw Error("ادخال خاطئ");
            let myInfo = await offersUser.findOne({
                attributes: ["id", "reasonSpam", "evaluate", "createdAt"],
                raw: true,
                where: {
                    userId: req.user.id,
                    id: req.query.offerUserId,
                },
                paranoid: false,
            });
            ///user is not have like this offer
            if (!myInfo) throw Error("رقم العرض المدخل غير صحيح");

            if (req.query.type === "spam") {
                if (!req.body.reasonSpam)
                    throw Error(
                        " الرجاء ادخال البيانات  بلشكل الصحيح وادخال  حقل ل الابلاغ"
                    );
                if (myInfo.reasonSpam)
                    throw Error(
                        "لقد قمت باجراء عملية الابلاغ على هذا العرض مسبقا"
                    );
            } else if (req.query.type === "evaluate") {
                if (!req.body.evaluate)
                    throw Error(
                        " الرجاء ادخال البيانات  بلشكل الصحيح وادخال  حقل ل التقيم"
                    );
                if (myInfo.evaluate)
                    throw Error(
                        "لقد قمت باجراء عملية التقيم على هذا العرض مسبقا"
                    );
            }

            if (moment(myInfo.createdAt).add(3, "day") < moment())
                throw Error(
                    "ان صلاحية العرض قد انتهت, لا يمكنك القيام بعملية الابلاغ او التقيم "
                );

            let updateInfo = null;
            if (req.query.type === "spam")
                updateInfo = { reasonSpam: req.body.reasonSpam.trim() };
            else updateInfo = { evaluate: req.body.evaluate };

            res.status(StatusCodes.OK).json({
                success: false,
                msg: "تمت العملية بنجاح",
            });
            offersUser.update(
                { ...updateInfo },
                { where: { id: req.query.offerUserId }, paranoid: false }
            );
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
    allMyOffer: async (req, res, next) => {
        try {
          
            const { page, size, state, search, typeOffer, categoryIds } =
                req.query;

            let conditionSearch = {};
            let conditionTypeOffer = {};
            let conditionCategory = {};
            if (typeOffer)
                conditionTypeOffer =
                    typeOffer === enumTypeOffer.free
                        ? { offerType: enumTypeOffer.free }
                        : { offerType: enumTypeOffer.paid };

            if (search)
                conditionSearch = {
                    [Op.or]: [
                        { nameStore: { [Op.like]: `%${search}%` } },
                        { locationText: { [Op.like]: `%${search}%` } },
                    ],
                };

            if (categoryIds) {
                let categoryIds = req.query.categoryIds;
                categoryIds = categoryIds.map((item) => +item);

                // check valid categoryIds
                let allValidIds = await category.findAll({
                    attributes: ["id"],
                    raw: true,
                });
                allValidIds = allValidIds.map((item) => item.id);

                categoryIds.forEach((item) => {
                    if (!allValidIds.includes(item))
                        throw Error("بعض القيم التصنيفات المدخلة غير صحيحة");
                });
                conditionCategory = { id: { [Op.in]: categoryIds } };
            }
            let data = null;
            if (state == enumStateOffer.normal) {
                data = await offersUser.findAll({
                    limit: +size,
                    offset: (+page - 1) * +size,
                    attributes: { exclude: ["userId", "packsStoreId"] },
                    paranoid: false,
                    include: {
                        model: packsStore,
                        required: true,
                        paranoid: false,
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
                                where: { ...conditionCategory },
                            },
                            where: { ...conditionSearch },
                        },
                    },
                    where: {
                        userId: req.user.id,
                        ...conditionTypeOffer,
                    },
                    order: [["createdAt", "ASC"]],
                });
                data = await Promise.all(
                    data.map(async (cart) => {
                        let allStoryForStore = await storeStory.findAll({
                            raw: true,
                            attributes: ["avatar"],
                            where: { storeId: cart.packsStore.store.id },
                        });
                        let QR = null;
                        if (
                            moment(cart.dataValues.createdAt).add(2, "day") <=
                            moment()
                        ) {
                            QR = cart.QR;
                        }
                        return {
                            offerUserId: cart.id,
                            state: false,
                            typeOffer: cart.offerType,
                            storeInfo: {
                                ...cart.packsStore.store.dataValues,
                                category: {
                                    ...cart.packsStore.store.category
                                        .dataValues,
                                },
                                story: allStoryForStore,
                            },
                            QR,
                            discount: cart["discount"],
                            dataTake: cart["dataTake"],

                            // stateOffer,
                            spam: cart.reasonSpam ? cart.reasonSpam : false,
                            evaluate: cart.evaluate ? cart.evaluate : false,
                            createdAt: cart.dataValues.createdAt,
                        };
                    })
                );
            } else {
                data = await giftedOffers.findAll({
                    paranoid: false,
                    limit: +size,
                    offset: (+page - 1) * +size,
                    attributes: ["offersUserId", "createdAt", "receiverId"],
                    include: [
                        {
                            model: user,
                            as: "receiver",
                            required: true,
                            paranoid: false,
                            attributes: ["username"],
                        },
                        {
                            model: offersUser,
                            required: true,
                            attributes: {
                                exclude: [
                                    "userId",
                                    "packsStoreId",
                                    "evaluate",
                                    "reasonSpam",
                                    "dataTake",
                                    "QR",
                                    "stateNotification",
                                ],
                            },
                            paranoid: false,
                            include: {
                                model: packsStore,
                                required: true,
                                paranoid: false,
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
                                        where: { ...conditionCategory },
                                    },
                                    where: { ...conditionSearch },
                                },
                            },
                            where: {
                                userId: sequelize.col("receiverId"),
                                ...conditionTypeOffer,
                            },
                            order: [["createdAt", "ASC"]],
                        },
                    ],
                    where: { senderId: req.user.id },
                });

                data = await Promise.all(
                    data.map(async (cart) => {
                        let allStoryForStore = await storeStory.findAll({
                            raw: true,
                            attributes: ["avatar"],
                            where: {
                                storeId:
                                    cart.offersUser.dataValues.packsStore.store
                                        .id,
                            },
                        });
                        return {
                            offerUserId: cart.offersUser.dataValues.id,
                            state: {
                                receiver: cart.receiver.username,
                                createdAt: cart.createdAt,
                            },
                            typeOffer: cart.offersUser.dataValues.offerType,
                            storeInfo: {
                                ...cart.offersUser.dataValues.packsStore.store
                                    .dataValues,
                                category: {
                                    ...cart.offersUser.dataValues.packsStore
                                        .store.category.dataValues,
                                },
                                story: allStoryForStore,
                            },
                            discount: cart.offersUser.dataValues["discount"],
                            createdAt: cart.offersUser.dataValues.createdAt,
                        };
                    })
                );
            }

            res.status(StatusCodes.OK).json({
                success: true,
                data,
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
    homePage: async (req, res, next) => {
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
                    userId: req.user.id,
                    offerType: conditionDiscount,
                },
            });
            return freeCartTaken.length ? freeCartTaken[0].count : 0;
        };

        try {
            let response = {};
            //!count Gift
            let countGift = await giftedOffers.findAll({
                raw: true,
                paranoid: false,

                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                group: "senderId",
                where: { senderId: req.user.id },
            });

            //! count
            let countFreeTaken = await countCart("Taken", "Free");
            let countFreeNotTaken = await countCart("notTaken", "Free");
            let countProTaken = await countCart("Taken", "Pro");
            let countProNotTaken = await countCart("notTaken", "Pro");

            // !countNotification
            let countNotificationNotRead = await notification.findAll({
                raw: true,
                paranoid: false,

                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                group: "userId", //index
                where: {
                    showType: enumShowNotification.notShow,
                    userId: req.user.id,
                },
            });

            // !offerNotTakeYet
            let offerNotTakeYet = await offersUser.findAll({
                attributes: ["createdAt", "discount"],
                paranoid: false,
                raw: true,
                include: {
                    model: packsStore,
                    paranoid: false,
                    required: true,
                    include: {
                        model: store,
                        required: true,
                        paranoid: false,
                        attributes: ["nameStore", "avatar"],
                    },
                },
                where: { userId: req.user.id },
            });
            offerNotTakeYet = offerNotTakeYet.map((infoStore) => {
                return {
                    createdAt: infoStore.createdAt,
                    discount: infoStore.discount,
                    store: {
                        name: infoStore["packsStore.store.nameStore"],
                        avatar: infoStore["packsStore.store.avatar"],
                    },
                };
            });

            // !recentVisited
            let recentVisited = await offersUser.findAll({
                attributes: ["dataTake"],
                paranoid: false,

                raw: true,
                include: {
                    model: packsStore,
                    required: true,
                    paranoid: false,

                    attributes: [],
                    include: {
                        model: store,
                        required: true,
                        paranoid: false,
                        attributes: ["nameStore", "id"],
                    },
                },
                where: { userId: req.user.id, dataTake: { [Op.not]: null } },
                limit: 4,
            });

            recentVisited = await Promise.all(
                recentVisited.map(async (myStore) => {
                    let storyForStore = await storeStory.findAll({
                        attributes: ["avatar"],
                        where: { storeId: myStore["packsStore.store.id"] },
                    });

                    return {
                        dateTake: myStore.dataTake,
                        namStore: myStore["packsStore.store.nameStore"],
                        story: storyForStore,
                    };
                })
            );

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
                    userId: req.user.id,
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

                countNotification: countNotificationNotRead.length
                    ? countNotificationNotRead[0].count
                    : 0,

                countYourGift: countYourGift > 0 ? countYourGift : 0,
                free: {
                    taken: countFreeTaken,
                    notTaken: countFreeNotTaken,
                },
                pro: {
                    taken: countProTaken,
                    notTaken: countProNotTaken,
                },

                offerNotTakeYet,
                recentVisited,
            };
            res.status(StatusCodes.OK).json({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    },
};
