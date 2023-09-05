import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import packsStore from "./packsStore.model.js";

class pack extends Model {}

pack.init(
    {
        name: {
            type: DataTypes.STRING(150),
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "name pack  can't be empty here ",
                },
            },
            unique: {
                args: true,
                msg: "اسم الباقة موجود من قبل",
            },
            set(value) {
                this.setDataValue("name", value.trim());
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            notEmpty: {
                msg: "duration can't be empty",
            },
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            notEmpty: {
                msg: "price can't be empty",
            },
        },
    },
    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        sequelize, // We need to pass the connection instance
        tableName: "pack",
        timestamps: false,

        //! Trigger
        //delete every store have this category
        //delete every userCategoryPivot have this category
        hooks: {
            beforeDestroy: async (packInfo) => {
                await packsStore.destroy({
                    where: { packId: packInfo.id },
                    raw: true,
                });
            },
        },
    }
);
export default pack;
