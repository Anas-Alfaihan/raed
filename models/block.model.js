import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import blockUser from "./blockUser.model.js";

class block extends Model {}

block.init(
    {
        reason: {
            type: DataTypes.STRING(300),
            allowNull: false,
            unique: "Unique_Fields",
            validate: {
                notEmpty: {
                    msg: "لا يمكنك ترك حقل لسبب فارغ ",
                },
            },
            set(value) {
                this.setDataValue("reason", value.trim());
            },
        },
        restrictions: {
            type: DataTypes.JSON,
            allowNull: false,
            set(value) {
                this.setDataValue("restrictions", value.trim());
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        sequelize,
        timestamps: false,
        tableName: "block",

        hooks: {
            beforeDestroy: async (blockInfo) => {
                await blockUser.destroy({
                    where: { blockId: blockInfo.id },
                    force: true,
                });
            },
        },
    }
);
export default block;
