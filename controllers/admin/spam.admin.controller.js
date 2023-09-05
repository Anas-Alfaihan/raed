import { Sequelize } from "sequelize";
import _ from "lodash";
import { StatusCodes } from "http-status-codes";
// MODELS
import { user, store } from "../../models/index.js";

export default {
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    AllSpamsForStore: async (req, res, next) => {
        try {
            let allSpams = await spams.findAll({
                attributes: ["reason", ["createdAt", "dateAt"], "id"],
                paranoid: false,
                include: [
                    {
                        model: user,
                        required: true,
                        paranoid: false,
                        attributes: [
                            "name",
                            "username",
                            "phoneNumber",
                            "gender",
                            "birthday",
                        ],
                    },
                    {
                        model: offer,
                        required: true,
                        paranoid: false,
                        include: {
                            model: store,
                            paranoid: false,
                            attributes: [],
                            required: true,
                            where: { nameStore: req.body.nameStore.trim() },
                        },
                        attributes: [],
                    },
                ],
            });

            res.status(StatusCodes.OK).send({ success: true, data: allSpams });
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
    AllStoreAndCount: async (req, res, next) => {
        try {
            let all = await spams.findAll({
                paranoid: false,
                include: {
                    model: offer,
                    paranoid: false,
                    attributes: ["id"],
                    required: true,
                    include: {
                        model: store,
                        paranoid: false,
                        required: true,
                        attributes: [
                            "nameStore",
                            "avatar",
                            "latitude",
                            "longitude",
                        ],
                    },
                },
                attributes: [
                    [Sequelize.fn("count", Sequelize.col("offerId")), "count"],
                ],
                group: ["offerId"],
            });

            res.status(StatusCodes.OK).send({ success: true, data: all });
        } catch (error) {
            next(error);
        }
    },
};
