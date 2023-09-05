import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import {
    user,
    store,
    category as Category,
    storeStory,
    offersUser,
    block,
    blockUser,
    packsStore,
    packs,
} from "../../models/index.js";
import usersCategory from "../../models/usersCategory.js";
import { Op, Sequelize, where } from "sequelize";
import {
    enumTakenAddOfferOrNot,
    enumType,
    enumTypeOffer,
} from "../../utils/enums.js";
import { sequelize } from "../../utils/connect.js";
import pack from "../../models/packs.model.js";
import { mergedRecords } from "./category.admin.controller.js";
import { readSetting } from "../../utils/helper.js";

export default {
    getChartStore: async (req, res, next) => {
        try {
            if (
                !(await store.findOne({
                    raw: true,
                    paranoid: false,
                    where: { id: req.params.id },
                    attributes: ["id"],
                    include: {
                        model: user,
                        required: true,
                        paranoid: false,
                        where: { roleId: 4 },
                        attributes: [],
                    },
                }))
            )
                throw Error("المحل غير موجود او انه غير مقبول");

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
                include: {
                    model: packsStore,
                    required: true,
                    paranoid: false,
                    attributes: [],
                    include: {
                        model: store,
                        paranoid: false,
                        required: true,
                        attributes: [],
                        where: { id: req.params.id },
                    },
                },
                where: { dataTake: { [Op.not]: null } },
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
                include: {
                    model: packsStore,
                    paranoid: false,
                    required: true,
                    attributes: [],
                    include: {
                        model: store,
                        paranoid: false,
                        required: true,
                        attributes: [],
                        where: { id: req.params.id },
                    },
                },
                where: { dataTake: null },
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
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    getAllStore: async (req, res, next) => {
        try {
            const { page, size, search, type, category, city } = req.query;

            let conditionCity = {};
            if (city) {
                conditionCity = { city };
            }
            let conditionCategory = {};
            if (category) {
                let checkCategory = await Category.findOne({
                    raw: true,
                    attributes: ["id"],
                    paranoid: false,
                    where: { name: category },
                });
                if (!checkCategory) throw Error("نوع الصنف المدخل غير صحيح");
                conditionCategory = { categoryId: checkCategory.id };
            }

            let conditionSearch = {};
            if (search)
                conditionSearch = {
                    [Op.or]: [
                        { nameStore: { [Op.like]: `%${search}%` } },
                        { locationText: { [Op.like]: `%${search}%` } },
                    ],
                };

            let conditionType = {};
            if (type != undefined && type == "true")
                conditionType = { roleId: 4 };
            else if (type != undefined && type == "false")
                conditionType = { roleId: 3 };

            let result = await store.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                attributes: [
                    "id",
                    "nameStore",
                    "locationText",
                    "fromHour",
                    "toHour",
                    "avatar",
                    "deletedAt",
                ],

                include: [
                    {
                        model: user,
                        required: true,
                        attributes: [],
                        paranoid: false,
                        where: { ...conditionType },
                    },

                    {
                        model: Category,
                        required: true,
                        paranoid: false,
                        attributes: ["name", "emoji"],
                    },
                ],
                where: {
                    ...conditionSearch,
                    ...conditionCategory,
                    ...conditionCity,
                },
            });

            result = result.map((storeInfo) => {
                return {
                    ...storeInfo,
                    avatar: storeInfo.avatar
                        ? storeInfo.avatar
                        : `${process.env.LINK}/images/static/cheaperLogo.jpg`,
                };
            });
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
    getInformation: async (req, res, next) => {
        try {
            let response = {};
            let storeAndUserInfo = await store.findOne({
                raw: true,
                paranoid: false,
                attributes: [
                    "id",
                    "nameStore",
                    "fromHour",
                    "toHour",
                    "locationText",
                    "longitude",
                    "latitude",
                    "city",
                    "deletedAt",
                ],
                include: {
                    model: user,
                    required: true,
                    paranoid: false,
                    attributes: [
                        "id",
                        "name",
                        "phoneNumber",
                        "username",
                        "avatar",
                        "gender",
                        "roleId",
                    ],
                },
                where: { id: req.params.id },
            });
            if (!storeAndUserInfo) throw Error("المتجر المحدد غير موجود");

            if (storeAndUserInfo["user.roleId"] === 4) {
                // get story for store
                let story = await storeStory.findAll({
                    where: { storeId: req.params.id },
                    raw: true,
                    paranoid: false,
                    attributes: ["avatar"],
                });

                let evaluateAverage = await offersUser.findAll({
                    raw: true,
                    paranoid: false,
                    attributes: [
                        [
                            Sequelize.fn("AVG", Sequelize.col("evaluate")),
                            "average",
                        ],
                    ],
                    include: {
                        model: packsStore,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { storeId: req.params.id },
                    },
                    where: {
                        evaluate: { [Op.not]: null },
                    },
                });

                let spam = await offersUser.findAll({
                    raw: true,
                    paranoid: false,
                    attributes: [
                        [
                            Sequelize.fn("COUNT", Sequelize.col("reasonSpam")),
                            "count",
                        ],
                    ],
                    include: {
                        model: packsStore,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { storeId: req.params.id },
                    },
                    where: {
                        evaluate: { [Op.not]: null },
                    },
                });

                let config = readSetting();
                // blocked now or not
                let blockCheck = await blockUser.findOne({
                    raw: true,
                    paranoid: false,
                    attributes: ["id"],
                    where: { userId: storeAndUserInfo["user.id"] },
                });

                let packedTaken = await packsStore.findAll({
                    raw: true,
                    attributes: [
                        [Sequelize.fn("count", Sequelize.col("id")), "count"],
                    ],
                    paranoid: false,
                    where: { takenGift: false, storeId: storeAndUserInfo.id },
                });

                response = {
                    storeInfo: {
                        ...storeAndUserInfo,
                        story,
                    },
                    evaluateAverage:
                        evaluateAverage[0].average == null
                            ? 0
                            : evaluateAverage[0].average,
                    spam: spam[0].count == null ? 0 : spam[0].count,
                    block: blockCheck ? true : false,
                    stillToGetFreePack: config.GiftPack - packedTaken[0].count,
                };
            } else
                response = {
                    storeInfo: {
                        ...storeAndUserInfo,
                    },
                };

            res.status(StatusCodes.OK).json({ success: true, data: response });
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
    getEvaluation: async (req, res, next) => {
        try {
            let attributes = {};
            const { page, size, type } = req.query;
            if (type === enumType.evaluate)
                attributes = { attributes: ["evaluate", "createdAt"] };
            else attributes = { attributes: ["reasonSpam", "createdAt"] };

            if (
                !(await store.findOne({
                    raw: true,
                    paranoid: false,
                    attributes: ["id"],
                    include: {
                        model: user,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { roleId: 4 },
                    },
                    where: { id: +req.query.storeId },
                }))
            )
                throw Error("لا يمكنك عرض محل غير مقبول او غير موجود ");

            let result = await offersUser.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                ...attributes,
                include: [
                    {
                        model: packsStore,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        include: {
                            model: store,
                            paranoid: false,
                            required: true,
                            attributes: [],
                            where: { id: +req.query.storeId },
                        },
                    },
                    {
                        model: user,
                        paranoid: false,
                        required: true,
                        attributes: ["avatar", "name"],
                    },
                ],
            });
            result = result.map((information) => {
                const { ["user.avatar"]: userAvatar, ...rest } = information;

                return {
                    ...rest,
                    avatar: userAvatar
                        ? userAvatar
                        : `${process.env.LINK}/images/static/cheaperLogo.jpg`,
                };
            });
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    deleteStore: async (req, res, next) => {
        try {
            let infoStore = await store.findByPk(req.params.id, {
                attributes: ["userId", "deletedAt"],
                paranoid: false,
                include: {
                    model: user,
                    required: true,
                    attributes: ["roleId"],
                },
            });
            if (!infoStore) throw Error("المحل المختار غير موجود");

            if (infoStore.deletedAt) throw Error("المحل المختار محذوف مسبقا");
            let deleteOption = {};
            if (infoStore.user.roleId == 3) {
                deleteOption = { force: true };
            } else {
                deleteOption = { force: false };
            }
            await sequelize.transaction();
            await sequelize.transaction(async (transaction) => {
                await store.destroy({
                    where: { id: req.params.id },
                    transaction,
                    ...deleteOption,
                });
                await user.destroy({
                    where: { id: infoStore.userId },
                    transaction,
                    ...deleteOption,
                });
            });

            res.status(StatusCodes.OK).json({ success: true });
        } catch (error) {
            next(error);
        }
    },
    blockStore: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                attributes: ["userId"],
                raw: true,
                where: { id: req.params.id },
                include: {
                    model: user,
                    required: true,
                    attributes: [],
                    where: { roleId: 4 },
                },
            });
            if (!storeInfo)
                throw Error(" المحل المحدد غير موجود او انه غير مقبول");

            if (
                await blockUser.findOne({
                    where: { userId: storeInfo.userId },
                    raw: true,
                    attributes: ["id"],
                })
            )
                throw Error("المحل محظور مسبقا");

            await sequelize.transaction(async (transaction) => {
                await store.update(
                    { showInBox: false },
                    { where: { id: req.params.id }, transaction }
                );
                await blockUser.create(
                    {
                        userId: storeInfo.userId,
                        blockId: 1,
                    },
                    { transaction }
                );
            });

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحظر بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
    unblockStore: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                attributes: ["userId"],
                raw: true,
                where: { id: req.params.id },
                include: {
                    model: user,
                    required: true,
                    attributes: [],
                    where: { roleId: 4 },
                },
            });
            if (!storeInfo)
                throw Error(" المحل المحدد غير موجود او انه غير مقبول");

            if (
                !(await blockUser.findOne({
                    where: { userId: storeInfo.userId },
                    raw: true,
                    attributes: ["id"],
                }))
            )
                throw Error("المحل غير محظور مسبقا");

            await sequelize.transaction(async (transaction) => {
                await store.update(
                    { showInBox: true },
                    { where: { id: req.params.id }, transaction }
                );
                await blockUser.destroy({
                    where: {
                        userId: storeInfo.userId,
                        blockId: 1,
                    },
                    transaction,
                });
            });

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية فك الحظر بنجاح",
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
     */ //records Blocked for manger store
    allBlockRecordManger: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                attributes: ["id"],
                include: {
                    model: user,
                    required: true,
                    attributes: ["id"],
                    paranoid: false,
                },
                where: { id: req.params.id },
                raw: true,
                paranoid: false,
            });
            if (!storeInfo) throw Error("رقم المتجر غير صحيح");

            let result = { active: [], notActive: [] };
            let allBlocked = await blockUser.findAll({
                paranoid: false,
                attributes: { exclude: ["id", "userId", "blockId"] },
                include: {
                    model: block,
                    required: true,
                    paranoid: false,
                    attributes: ["reason", "duration", "restrictions"],
                },
                raw: true,
                where: { userId: storeInfo["user.id"] },
            });
            allBlocked.forEach((e) => {
                if (e.unblock_date) result.notActive.push(e);
                else result.active.push(e);
            });
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    getUsersStore: async (req, res, next) => {
        try {
            if (
                !(await store.findOne({
                    raw: true,
                    paranoid: false,
                    where: { id: +req.query.storeId },
                    attributes: ["id"],
                    include: {
                        model: user,
                        required: true,
                        paranoid: false,
                        where: { roleId: 4 },
                        attributes: [],
                    },
                }))
            )
                throw Error("المحل غير موجود او انه غير مقبول");

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
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { username: { [Op.like]: `%${search}%` } },
                    ],
                };

            let result = await offersUser.findAll({
                limit: +size,
                offset: (+page - 1) * +size,
                raw: true,
                paranoid: false,
                attributes: [
                    "createdAt",
                    "discount",
                    "dataTake",
                    "offerType",
                    "evaluate",
                    "reasonSpam",
                ],
                include: [
                    {
                        model: user,
                        required: true,
                        paranoid: false,
                        attributes: ["name", "username", "avatar"],
                        where: { ...conditionSearch },
                    },
                    {
                        model: packsStore,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        include: {
                            model: store,
                            required: true,
                            paranoid: false,
                            attributes: [],
                            where: { id: +req.query.storeId },
                        },
                    },
                ],

                where: {
                    ...conditionPaid,
                    ...conditionTypeOffer,
                },
            });

            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    getPacksStore: async (req, res, next) => {
        try {
            if (
                !(await store.findOne({
                    raw: true,
                    paranoid: false,
                    where: { id: req.params.id },
                    attributes: ["id"],
                    include: {
                        model: user,
                        required: true,
                        paranoid: false,
                        where: { roleId: 4 },
                        attributes: [],
                    },
                }))
            )
                throw Error("المحل غير موجود او انه غير مقبول");

            let result = await packsStore.findAll({
                raw: true,
                paranoid: false,
                attributes: ["cost", "createdAt", "id"],
                include: [
                    {
                        model: packs,
                        required: true,
                        paranoid: false,
                        attributes: ["name", "duration"],
                    },
                    {
                        model: store,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { id: req.params.id },
                    },
                ],
            });

            result = await Promise.all(
                result.map(async (packInfo) => {
                    let countPaid = await offersUser.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            "packsStoreId",
                            [
                                Sequelize.fn("count", Sequelize.col("id")),
                                "count",
                            ],
                        ],
                        where: {
                            packsStoreId: packInfo.id,
                            dataTake: { [Op.not]: null },
                        },
                        group: "packsStoreId",
                    });

                    let countNotPaid = await offersUser.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            "packsStoreId",
                            [
                                Sequelize.fn("count", Sequelize.col("id")),
                                "count",
                            ],
                        ],
                        where: {
                            packsStoreId: packInfo.id,
                            dataTake: null,
                        },
                        group: "packsStoreId",
                    });
                    return {
                        ...packInfo,
                        id: undefined,
                        count: {
                            paid: countPaid.length ? countPaid[0].count : 0,
                            notPaid: countNotPaid.length
                                ? countNotPaid[0].count
                                : 0,
                        },
                    };
                })
            );
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    acceptStores: async (req, res, next) => {
        try {
            let { ids } = req.query;
            ids = ids.map((id) => +id);
            let allStore = await Promise.all(
                ids.map(async (id) => {
                    let myStore = await store.findOne({
                        attributes: ["id"],
                        where: { id },
                        include: {
                            model: user,
                            required: true,
                            attributes: ["roleId", "id"],
                            where: { roleId: 3 },
                        },
                    });
                    if (!myStore)
                        throw Error(
                            "بعض المحلات المختار غير موجودة او انه مقبولة"
                        );

                    if (myStore.user.roleId === 4)
                        throw Error("بعض المتاجر مقبولة مسبقا");
                    return myStore;
                })
            );
            let config = readSetting();
            await Promise.all(
                allStore.map(async (myStore) => {
                    await sequelize.transaction(async (transaction) => {
                        await user.update(
                            { roleId: 4 },
                            { where: { id: myStore.user.id }, transaction }
                        );
                        await store.update(
                            { showInBox: true },
                            { where: { id: myStore.id }, transaction }
                        );
                        await packsStore.create(
                            {
                                storeId: myStore.id,
                                packId: 1,
                                discount: config.discountFree,
                                cost: 0,
                                takenGift: true,
                            },
                            { transaction }
                        );
                    });
                })
            );

            res.status(StatusCodes.OK).json({ success: true });
        } catch (error) {
            next(error);
        }
    },
    enable: async (req, res, next) => {
        try {
            let storeInfo = await store.findOne({
                where: { id: req.params.id },
                attributes: ["deletedAt", "userId", "id"],
                paranoid: false,
            });
            if (!storeInfo.deletedAt) throw Error("المحل المحدد غير محذوف");

            let userInfo = await user.findOne({
                attributes: ["id"],
                where: { id: storeInfo.userId },
                paranoid: false,
            });

            res.status(StatusCodes.OK).json({ success: true });
            await storeInfo.restore();
            await userInfo.restore();
        } catch (error) {
            next(error);
        }
    },
};
