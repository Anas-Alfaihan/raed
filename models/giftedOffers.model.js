import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";

class giftedOffers extends Model {}
giftedOffers.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        offersUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: "giftedOffers", // We need to choose the model name
        timestamp: true,
        updatedAt: false,
    }
);
export default giftedOffers;
