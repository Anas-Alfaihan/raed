import moment from "moment";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

//MODELS
import { offersUser, packsStore, store, user } from "../../models/index.js";
import { Op, Sequelize } from "sequelize";
let mergedRecordsStoreChart = (freeOffers, paidOffers) => {
    const mergedRecords = {};

    paidOffers.forEach((paidOffer) => {
        const { year, month, count } = paidOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].paidCount = count;
    });

    freeOffers.forEach((freeOffer) => {
        const { year, month, count } = freeOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].freeCount = count;
    });

    let result = [];
    for (const year in mergedRecords) {
        for (const month in mergedRecords[year]) {
            const { paidCount, freeCount } = mergedRecords[year][month];
            result.push({
                date: `${year}-${`${month}`.length == 1 ? `0${month}` : month}`,
                paidCount: paidCount ? paidCount : 0,
                freeCount: freeCount ? freeCount : 0,
            });
        }
    }
    return result;
};
let mergedRecordsCartChart = (
    CardNotBought,
    CardBought,
    UserNotBought,
    UserBought
) => {
    const mergedRecords = {};

    CardNotBought.forEach((paidOffer) => {
        const { year, month, count } = paidOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].cardNotBought = count;
    });
    CardBought.forEach((freeOffer) => {
        const { year, month, count } = freeOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].cardBought = count;
    });
    UserNotBought.forEach((freeOffer) => {
        const { year, month, count } = freeOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].userNotBought = count;
    });
    UserBought.forEach((freeOffer) => {
        const { year, month, count } = freeOffer;
        if (!mergedRecords[year]) {
            mergedRecords[year] = {};
        }
        if (!mergedRecords[year][month]) {
            mergedRecords[year][month] = {};
        }
        mergedRecords[year][month].userBought = count;
    });

    let result = [];
    for (const year in mergedRecords) {
        for (const month in mergedRecords[year]) {
            const { cardNotBought, cardBought, userNotBought, userBought } =
                mergedRecords[year][month];

            result.push({
                date: `${year}-${`${month}`.length == 1 ? `0${month}` : month}`,
                cardNotBought: cardNotBought ? cardNotBought : 0,
                cardBought: cardBought ? cardBought : 0,
                userNotBought: userNotBought ? userNotBought : 0,
                userBought: userBought ? userBought : 0,
            });
        }
    }
    return result;
};
import nodeCache from "../../utils/cache.js";
export default {
    getCount: async (req, res, next) => {
        try {
            let response = {};
            let countUser = await user.findAll({
                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                raw: true,
                group: "roleId",
                paranoid: false,
                where: { roleId: 2 },
            });
            let countStore = await store.findAndCountAll();

            let countBuyOffer = await offersUser.findAll({
                raw: true,
                attributes: [
                    [Sequelize.fn("YEAR", Sequelize.col("dataTake")), "year"],
                    [Sequelize.fn("MONTH", Sequelize.col("dataTake")), "month"],
                    [
                        Sequelize.fn("COUNT", Sequelize.col("offersUser.id")),
                        "count",
                    ],
                ],

                group: ["year", "month"],
                having: {
                    month: moment().month() + 1,
                    year: moment().year(),
                },
            });
            response = {
                countUser: countUser.length ? countUser[0].count : 0,
                countStore: countStore.count,
                countBuyOffer: countBuyOffer.length
                    ? countBuyOffer[0].count
                    : 0,
            };

            res.status(StatusCodes.OK).send({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    },

    //! charts
    userChart: async (req, res, next) => {
        try {
            let chartUser = await user.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [Sequelize.fn("DAY", Sequelize.col("createdAt")), "day"],
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                where: {
                    roleId: 2,
                },
                group: ["day", "month", "year"],
                order: [["createdAt", "ASC"]],
            });
            chartUser = chartUser.map((info) => {
                return {
                    date: `${info.year}-${
                        `${info.month}`.length == 1
                            ? `0${info.month}`
                            : info.month
                    }-${`${info.day}`.length == 1 ? `0${info.day}` : info.day}`,
                    count: info.count,
                };
            });
            res.status(StatusCodes.OK).send({ success: true, data: chartUser });
        } catch (error) {
            next(error);
        }
    },
    storeChart: async (req, res, next) => {
        try {
            let storeChartFree = await packsStore.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                where: {
                    packId: 1,
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });
            let storeChartPro = await packsStore.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                where: {
                    packId: { [Op.not]: 1 },
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });

            let data = mergedRecordsStoreChart(storeChartFree, storeChartPro);

            res.status(StatusCodes.OK).send({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    },
    cityChart: async (req, res, next) => {
        try {
            let chartUser = await store.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    "city",
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],

                group: ["city", "year", "month"],
                order: [["createdAt", "ASC"]],
            });
            chartUser = chartUser.map((info) => {
                return {
                    city: info.city,
                    date: `${info.year}-${
                        `${info.month}`.length == 1
                            ? `0${info.month}`
                            : info.month
                    }`,
                    count: info.count,
                };
            });
            res.status(StatusCodes.OK).send({ success: true, data: chartUser });
        } catch (error) {
            next(error);
        }
    },
    cartChart: async (req, res, next) => {
        try {
            let cardNotBought = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                where: {
                    dataTake: null,
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });

            let cardBought = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                ],
                where: {
                    dataTake: { [Op.not]: null },
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });

            let userNotBought = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [
                        Sequelize.fn(
                            "COUNT",
                            Sequelize.literal("DISTINCT userId")
                        ),
                        "count",
                    ],
                ],
                where: {
                    dataTake: null,
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });

            let userBought = await offersUser.findAll({
                raw: true,
                paranoid: false,
                attributes: [
                    [
                        Sequelize.fn("MONTH", Sequelize.col("createdAt")),
                        "month",
                    ],
                    [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
                    [
                        Sequelize.fn(
                            "COUNT",
                            Sequelize.literal("DISTINCT userId")
                        ),
                        "count",
                    ],
                ],
                where: {
                    dataTake: { [Op.not]: null },
                },
                group: ["year", "month"],
                order: [["createdAt", "ASC"]],
            });

            let data = mergedRecordsCartChart(
                cardNotBought,
                cardBought,
                userNotBought,
                userBought
            );

            res.status(StatusCodes.OK).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    },
};
