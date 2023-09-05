import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import user from "./user.model.js";
import storeStory from "./storeStory.model.js";
import packsStore from "./packsStore.model.js";
class store extends Model {}

store.init(
    {
        nameStore: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [2, 255], //mean min length  4 and max  length 10
                notEmpty: true,
            },
            set(value) {
                this.setDataValue("nameStore", value.trim());
            },
        },
        avatar: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        fromHour: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        toHour: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        showInBox: {
            allowNull: true,
            type: DataTypes.BOOLEAN,
        },
        locationText: { allowNull: true, type: DataTypes.STRING() },
        longitude: {
            allowNull: false,
            type: DataTypes.FLOAT(10, 6),
        },
        latitude: {
            allowNull: false,
            type: DataTypes.FLOAT(10, 6),
        },
        city: { type: DataTypes.STRING, allowNull: false },
    },
    {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: "store", // We need to choose the model name
        timestamps: true,
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        paranoid: true,

        hooks: {
            beforeDestroy: (storeInfo, option) => {
                // console.log({ storeInfo, option });
                // await user.destroy({
                //     where: { id: storeInfo.userId },
                //     force: true,
                // });
                // await storeStory.destroy({
                //     force: true,
                //     where: { storeId: storeInfo.id },
                // });
                // await packsStore.destroy({
                //     force: true,
                //     where: { storeId: storeInfo.id },
                // });
            },
        },
    }
);
export default store;
