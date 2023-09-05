import { Op } from "sequelize";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import {
    category,
    notification,
    offersUser,
    packsStore,
    store,
    token,
    user,
    usersCategory,
} from "../../models/index.js";
import Sequelize from "sequelize";
import { enumShowNotification } from "../../utils/enums.js";
import notificationSender from "../../utils/notification.js";
import moment from "moment";
import nodeCache from "../../utils/cache.js";
export let mergedRecords = (taken, notTaken) => {
    const mergedRecords = {};

    taken.forEach((takenInfo) => {
        const { year, month, count } = takenInfo;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].taken = count;
    });

    notTaken.forEach((notTakenInfo) => {
        const { year, month, count } = notTakenInfo;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].notTaken = count;
    });

    let result = [];
    for (const year in mergedRecords) {
        for (const month in mergedRecords[year]) {
            const { taken, notTaken } = mergedRecords[year][month];
            result.push({
                date: `${year}-${`${month}`.length == 1 ? `0${month}` : month}`,
                taken: taken ? taken : 0,
                notTaken: notTaken ? notTaken : 0,
            });
        }
    }
    return result;
};

//json notification for users, accepted store
let sendNotificationForCategory = async () => {
    try {
        // get user to json notification
        let usersSender = await token.findAll({
            attributes: ["tokenDevice", "userId"],
            raw: true,
            include: {
                module: user,
                attributes: [],
                required: true,
                where: {
                    // users , accepted store
                    roleId: { [Op.in]: [2, 4] },
                },
            },
        });

        let message = {
            title: "اضافة جديدة",
            message:
                "تمت اضافة تصنيف جديد الى قائمة التصنيفات ,سارع للاطلاع عليه",
        };
        notificationSender.sendMultiple(
            usersSender.map((userInfo) => userInfo.tokenDevice),
            message
        );
        // json message for every userSender
        await Promise.all(
            usersSender.map(async (userInfo) => {
                await notification.create({
                    title: message.title,
                    message: message.message,
                    type: enumShowNotification.notShow,
                    avatar: process.env.LINK + `/images/static/cheaperLogo.jpg`,
                    userId: userInfo.userId,
                });
            })
        );
    } catch (error) {}
};

let deleteCache = (urls) => {
    nodeCache.del([...urls]);
};
export default {
    /*
     * @auth admins
     * private admin
     * @method POST
     * @work create category
     */
    create: async (req, res, next) => {
        try {
            let categoryInfo = await category.findOne({
                attributes: ["id"],
                raw: true,
                where: {
                    name: req.body.name.trim(),
                },
            });
            if (categoryInfo) throw Error(`اسم الصنف موجود من قبل`);

            await category.create({ ...req.body });

            deleteCache(["/admin/category/all"]);

            //! json notification to all users we adding new category
            // await sendNotificationForCategory();
            res.status(StatusCodes.CREATED).json({
                success: true,
                msg: "تمت عملية الانشاء بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth admins
     * private admin
     * @method PUT
     * @work update category
     */

    update: async (req, res, next) => {
        try {
            let categoryInfo = await category.findByPk(req.params.id, {
                attributes: ["id"],

                raw: true,
            });
            if (!categoryInfo) throw Error(`رقم الصنف غير صحيح`);
            categoryInfo = await category.findOne({
                attributes: ["id"],
                raw: true,
                where: {
                    name: req.body.name.trim(),
                    id: { [Op.not]: req.params.id },
                },
            });
            if (categoryInfo) throw Error(`اسم الصنف موجود من قبل`);
            //create category in db
            await category.update(
                { ...req.body },
                { where: { id: req.params.id } }
            );
            deleteCache(["/admin/category/all"]);
            res.status(StatusCodes.OK).json({
                success: true,
                msg: `تمت عملية التحديث بنجاح `,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth admins
     * private admin
     * @method DELETE
     * @work delete category
     */

    remove: async (req, res, next) => {
        //if remove category then => will delete for every user interests and store has this category
        try {
            const categoryInfo = await category.findByPk(req.params.id, {
                attributes: ["id"],
            });
            if (!categoryInfo) throw Error("رقم الصنف غير صحيح ");
            await categoryInfo.destroy({ force: true });
            deleteCache(["/admin/category/all"]);
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth admins
     * private admin
     * @method GET
     * @work get all category and search in frontend
     */
    getAllCategory: async (req, res, next) => {
        try {
            let allCategory = await category.findAll({
                raw: true,
                paranoid: false,
            });
            allCategory = await Promise.all(
                allCategory.map(async (myCategory) => {
                    //  ! all count user has this category
                    let allCountUser = await usersCategory.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            [
                                Sequelize.fn("COUNT", Sequelize.col("userId")),
                                "count",
                            ],
                        ],
                        where: { categoryId: myCategory.id },
                    });

                    //  ! all count store type of this  category
                    let allStoreCount = await store.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            [
                                Sequelize.fn("COUNT", Sequelize.col("id")),
                                "count",
                            ],
                        ],
                        where: { categoryId: myCategory.id },
                    });

                    //  ! all count offer taken this month
                    // let allOfferTaken = await offersUser.findAll({
                    //     raw: true,
                    //     attributes: [
                    //         [
                    //             Sequelize.fn(
                    //                 "MONTH",
                    //                 Sequelize.col("offersUser.createdAt")
                    //             ),
                    //             "month",
                    //         ],
                    //         [
                    //             Sequelize.fn(
                    //                 "COUNT",
                    //                 Sequelize.col("offersUser.id")
                    //             ),
                    //             "count",
                    //         ],
                    //     ],
                    //     include: {
                    //         model: packsStore,
                    //         required: true,
                    //         attributes: [],
                    //         include: {
                    //             model: store,
                    //             required: true,
                    //             attributes: [],
                    //             where: { categoryId: myCategory.id },
                    //         },
                    //     },
                    //     where: Sequelize.literal(
                    //         "MONTH(dataTake)= MONTH(CURRENT_DATE())"
                    //     ),
                    //     where: Sequelize.literal("dataTake!=null"),
                    //     group: "month",
                    // });

                    // // CHART OFFER TAKEN
                    // let chartOfferTaken = await offersUser.findAll({
                    //     raw: true,
                    //     attributes: [
                    //         [
                    //             Sequelize.fn(
                    //                 "MONTH",
                    //                 Sequelize.col("dataTake")
                    //             ),
                    //             "month",
                    //         ],
                    //         [
                    //             Sequelize.fn(
                    //                 "COUNT",
                    //                 Sequelize.col("offersUser.id")
                    //             ),
                    //             "count",
                    //         ],
                    //     ],
                    //     include: {
                    //         model: packsStore,
                    //         required: true,
                    //         attributes: [],
                    //         include: {
                    //             model: store,
                    //             required: true,
                    //             attributes: [],
                    //             where: { categoryId: myCategory.id },
                    //         },
                    //     },
                    //     where: { dataTake: { [Op.not]: null } },
                    //     group: "month",
                    // });
                    let allOfferTaken = await offersUser.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            [
                                Sequelize.fn(
                                    "MONTH",
                                    Sequelize.col("offersUser.dataTake")
                                ),
                                "month",
                            ],
                            [
                                Sequelize.fn(
                                    "year",
                                    Sequelize.col("offersUser.dataTake")
                                ),
                                "year",
                            ],
                            [
                                Sequelize.fn(
                                    "COUNT",
                                    Sequelize.col("offersUser.id")
                                ),
                                "count",
                            ],
                        ],
                        include: {
                            model: packsStore,
                            required: true,
                            attributes: [],
                            paranoid: false,
                            include: {
                                model: store,
                                required: true,
                                paranoid: false,
                                attributes: [],
                                where: { categoryId: myCategory.id },
                            },
                        },
                        where: {
                            dataTake: { [Op.not]: null },
                        },
                        group: ["month", "year"],
                        having: {
                            month: moment().month() + 1,
                            year: moment().year(),
                        },
                    });

                    return {
                        id: myCategory.id,
                        name: myCategory.name,
                        emoji: myCategory.emoji,
                        checkWithImageOrNot: myCategory.checkWithImageOrNot,
                        count: {
                            store: allStoreCount.length
                                ? allStoreCount[0].count
                                : 0,
                            user: allCountUser.length
                                ? allCountUser[0].count
                                : 0,
                            offerTaken: allOfferTaken.length
                                ? allOfferTaken[0].count
                                : 0,
                        },
                    };
                })
            );

            res.status(StatusCodes.OK).json({
                success: true,
                data: allCategory,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth admins
     * private admin
     * @method GET
     * @work get Chart For Category
     */
    getChartForCategory: async (req, res, next) => {
        try {
            let categoryExist = await category.findOne({
                raw: true,
                paranoid: false,
                attributes: { exclude: ["checkWithImageOrNot"] },
                where: { id: +req.query.categoryId },
            });

            if (!categoryExist) throw Error("الصنف المطلوب غير موجود");

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
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { categoryId: +req.query.categoryId },
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
                    required: true,
                    paranoid: false,
                    attributes: [],
                    include: {
                        model: store,
                        required: true,
                        paranoid: false,
                        attributes: [],
                        where: { categoryId: +req.query.categoryId },
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
};
