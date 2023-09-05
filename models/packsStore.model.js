import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import offersUser from "./offersUser.model.js";

class packsStore extends Model {}

packsStore.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        storeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        packId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discount: { type: DataTypes.FLOAT, allowNull: false },
        cost: { type: DataTypes.INTEGER, allowNull: true },
        takenGift: { type: DataTypes.BOOLEAN, allowNull: false },
        //is mean deleted date, when store manger click delete pack or ended pack
    },

    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        sequelize, // We need to pass the connection instance
        tableName: "packsStore",
        timestamps: true,
        updatedAt: false,
        paranoid: true, //to set the delateAt
        hooks: {
            beforeDestroy: async (packsStoreInfo) => {
                await offersUser.destroy({
                    where: { packsStoreId: packsStoreInfo.id },
                    raw: true,
                });
            },
        },
    }
);

export default packsStore;
