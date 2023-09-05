import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import { enumTakenAddOfferOrNot, enumTypeOffer } from "../utils/enums.js";

class offersUser extends Model {}
offersUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        packsStoreId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dataTake: { type: DataTypes.DATE, allowNull: true },
        QR: {
            type: DataTypes.STRING(400),
            allowNull: true,
        },
        discount: { type: DataTypes.FLOAT, allowNull: false },
        cost: { type: DataTypes.INTEGER, allowNull: true },
        offerType: {
            type: DataTypes.ENUM,
            values: Object.values(enumTypeOffer),
            allowNull: false,
        },
        stateNotification: { type: DataTypes.BOOLEAN, allowNull: true },
        evaluate: { type: DataTypes.INTEGER, allowNull: true },
        takenGift: {
            type: DataTypes.ENUM,
            values: Object.values(enumTakenAddOfferOrNot),
            allowNull: false,
        },
        reasonSpam: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        //* createdAt , mean from this filed i can calc the Expiry date
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            isDate: true,
            validate: {
                isDate: {
                    msg: "الرجاء ادخال التاريخ بلشكل الصحيح ",
                },
            },
            get() {
                if (this.getDataValue("disableAt"))
                    return moment
                        .utc(this.getDataValue("disableAt"))
                        .format("YYYY-MM-DD");
            },
        },
    },
    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: "offersUser", // We need to choose the model name
        deletedAt: "deletedAt",
        timestamp: true,
        updatedAt: false,
        paranoid: true,
    }
);
export default offersUser;
