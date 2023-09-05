import { Op, Sequelize } from "sequelize";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import {
    token,
    notification,
    offersUser,
    user,
    usersCategory,
    packsStore,
    category,
    store,
} from "../../models/index.js";
import control from "../users.controllers.js";
import moment from "moment";
import { enumActive, enumShowNotification } from "../../utils/enums.js";
import controlNotification from "../../utils/notification.js";
export default {
    send: async (req, res, next) => {
        try {
            const { type, categories, gender, active, city, subscribe } =
                req.query;
            let conditionGender = {};
            let conditionCategories = {};
            let allUsersId = [];
            let categoriesIds = null;
            if (categories && categories.length) {
                categoriesIds = await control.validationCategory(
                    categories,
                    null
                );

                if (categoriesIds.error) throw new Error(categoriesIds.error);

                categoriesIds = categoriesIds.array.map(
                    (item) => item.categoryId
                );
            }

            if (type === "users") {
                if (city || subscribe)
                    throw new Error(
                        "بعض الحقول المدخلة غير موافقة لنوع المختار"
                    );

                if (gender) conditionGender = { gender };

                if (
                    active == enumActive.active ||
                    active == enumActive.unActive
                ) {
                    allUsersId = await offersUser.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            [Sequelize.literal("DISTINCT userId"), "id"],
                            [
                                Sequelize.literal("MAX(offersUser.createdAt)"),
                                "latestDate",
                            ],
                        ],
                        group: ["id"],
                        order: [["createdAt", "DESC"]],
                        include: {
                            model: user,
                            required: true,
                            attributes: [],
                            paranoid: false,
                            where: { ...conditionGender },
                        },
                    });
                    const now = moment();
                    allUsersId = allUsersId.filter((offerInfo) => {
                        const asDay = now.diff(
                            offerInfo.latestDate,
                            "day",
                            true
                        );
                        if (active == enumActive.active && asDay < 7)
                            return { id: offerInfo.id };
                        else if (active == enumActive.unActive && asDay > 7)
                            return { id: offerInfo.id };
                    });
                } else {
                    allUsersId = await user.findAll({
                        raw: true,
                        attributes: ["id"],
                        paranoid: false,
                        where: { ...conditionGender, roleId: 2 },
                    });
                }

                if (allUsersId.length == 0)
                    throw Error(
                        "لا يوجد اي مستخدم يطابق الفلاتر التم تم وضعها"
                    );
                allUsersId = allUsersId.map((record) => record.id);
                if (categories && categories.length) {
                    let allCategory = await usersCategory.findAll({
                        raw: true,
                        attributes: [
                            [Sequelize.literal("DISTINCT userId"), "userId"],
                        ],
                        where: {
                            categoryId: { [Op.in]: categoriesIds },
                            userId: { [Op.in]: allUsersId },
                        },
                    });
                    if (allCategory.length == 0)
                        throw Error(
                            "لا يوجد اي مستخدم يطابق الفلاتر التم تم وضعها"
                        );
                    allUsersId = allCategory.map((record) => record.userId);
                }
                // console.log("users :", allUsersId);
            } else {
                if (gender || active || (categories && categories.length > 1))
                    throw new Error(
                        "بعض الحقول المدخلة غير موافقة لنوع المختار"
                    );
                let conditionCity = {};
                if (city) conditionCity = { city };

                if (categories) {
                    let result = await control.validationCategory(categories);
                    if (result.error) throw new Error(result.error);
                    conditionCategories = {
                        categoryId: result.array[0].categoryId,
                    };
                }

                // get all userId for store
                allUsersId = await packsStore.findAll({
                    raw: true,
                    paranoid: false,
                    attributes: [
                        [Sequelize.literal("DISTINCT storeId"), "storeId"],
                        [
                            Sequelize.literal("MAX(packsStore.createdAt)"),
                            "latestDate",
                        ],
                        "deletedAt",
                    ],
                    group: ["storeId"],
                    order: [["createdAt", "DESC"]],

                    include: {
                        model: store,
                        required: true,
                        attributes: [],
                        include: {
                            model: user,
                            required: true,
                            attributes: ["id"],
                        },
                        where: { ...conditionCategories, ...conditionCity },
                    },
                });
                if (allUsersId.length == 0)
                    throw Error("لا يوجد اي محل يطابق الفلاتر التم تم وضعها");

                if (subscribe == "true" || subscribe == "false") {
                    allUsersId = allUsersId.map((record) => {
                        if (
                            (subscribe == "true" &&
                                record.deletedAt === null) ||
                            (subscribe == "false" && record.deletedAt != null)
                        )
                            return record["store.user.id"];
                    });
                } else {
                    allUsersId = allUsersId.map((record) => {
                        return record["store.user.id"];
                    });
                }
                allUsersId = allUsersId.filter((item) => item !== undefined);
                if (allUsersId.length == 0)
                    throw Error("لا يوجد اي محل يطابق الفلاتر التم تم وضعها");

                // console.log("managers", allUsersId);
            }

            let tokenSend = await token.findAll({
                raw: true,
                attributes: ["tokenDevice"],
                where: { userId: { [Op.in]: allUsersId } },
            });
            tokenSend = tokenSend.map((rawToken) => rawToken.tokenDevice);
            // console.log(tokenSend);
            await controlNotification.sendMultiple(
                tokenSend,
                {
                    ...req.body,
                    image:
                        process.env.LINK + "/images/static/logo_400x400.webp",
                },
                next
            );

            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الارسال بنجاح",
            });
            let allNotification = allUsersId.map((id) => {
                return {
                    userId: id,
                    ...req.body,
                    showType: enumShowNotification.notShow,
                    avatar:
                        process.env.LINK + "/images/static/logo_400x400.webp",
                };
            });
            await notification.bulkCreate(allNotification);
        } catch (error) {
            next(error);
        }
    },
};
