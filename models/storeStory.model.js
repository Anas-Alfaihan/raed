import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";

class storeStory extends Model {}

storeStory.init(
    {
        avatar: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: "storeStory", // We need to choose the model name
        timestamps: true,
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        paranoid: true,
        updatedAt: false,
    }
);
export default storeStory;
