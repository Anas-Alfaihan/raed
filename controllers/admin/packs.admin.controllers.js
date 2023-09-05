import { Op } from "sequelize";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import { packs, packsStore } from "../../models/index.js";
import Sequelize from "sequelize";
export default {
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    create: async (req, res, next) => {
        try {
            await packs.create({ ...req.body });
            res.status(StatusCodes.CREATED).send({
                success: true,
                msg: `تم انشاء الباقة بنجاح `,
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
    update: async (req, res, next) => {
        try {
            let pack = await packs.findByPk(req.params.id, {
                attributes: ["id"],
            });
            if (!pack) throw Error(`رقم الباقة غير صحيح `);

            await packs.update(
                { ...req.body },
                { where: { id: req.params.id } }
            );
            res.status(StatusCodes.OK).send({
                success: true,
                msg: `تم تحديث الباقة بنجاح `,
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
    remove: async (req, res, next) => {
        //if remove category then => will delete for every user interests
        try {
            if (req.params.id == 1)
                throw Error(
                    "لا يمكنك اجراء عملية الحذف لان الباقة هي الباقة الافتراضية "
                );
            const pack = await packs.findByPk(req.params.id, {
                attributes: ["id"],
            });
            if (!pack) throw Error("رقم الباقة غير صحيح ");

            await pack.destroy({ force: true });
            res.status(StatusCodes.OK).send({
                success: true,
                msg: "تمت عملية الحذف بنجاح ",
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

    getAllPacks: async (req, res, next) => {
        try {
            let allPack = await packs.findAll({
                raw: true,
                attributes: ["id", "name", "duration", "price"],
            });
            res.status(StatusCodes.OK).send({ success: true, data: allPack });
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
    chartPack: async (req, res, next) => {
        try {
            let allPack = await packs.findAll({
                raw: true,
                paranoid: false,
                attributes: ["id", "name", "duration", "price"],
            });

            allPack = await Promise.all(
                allPack.map(async (myPack) => {
                    let packWithCount = await packsStore.findAll({
                        raw: true,
                        paranoid: false,
                        attributes: [
                            [
                                Sequelize.fn(
                                    "YEAR",
                                    Sequelize.col("createdAt")
                                ),
                                "year",
                            ],
                            [
                                Sequelize.fn(
                                    "MONTH",
                                    Sequelize.col("createdAt")
                                ),
                                "month",
                            ],

                            [
                                Sequelize.fn("COUNT", Sequelize.col("id")),
                                "count",
                            ],
                        ],
                        group: ["year", "month"],
                        order: [[Sequelize.col("createdAt", "ASC")]],
                        where: { packId: myPack.id },
                    });

                    return {
                        ...myPack,
                        countWithDate: packWithCount.map((element) => {
                            return {
                                date: `${element.year}-${
                                    `${element.month}`.length == 1
                                        ? `0${element.month}`
                                        : element.month
                                }`,

                                count: element.count,
                            };
                        }),
                    };
                })
            );
            res.status(StatusCodes.OK).send({ success: true, data: allPack });
        } catch (error) {
            next(error);
        }
    },
};
