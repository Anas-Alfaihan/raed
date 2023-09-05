import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";

class blockUser extends Model {}
blockUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        blockId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        block_date: {
            type: DataTypes.DATE,
            allowNull: false,
            isDate: true,
        },
    },
    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        sequelize, // We need to pass the connection instance
        modelName: "blockUser", // We need to choose the model name
        timestamp: true,
        updatedAt: false,
        paranoid: true,
        createdAt: "block_date",
        deletedAt: "unblock_date",
    }
);
export default blockUser;
