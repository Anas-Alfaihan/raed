import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";

class tokenTable extends Model {}

tokenTable.init(
    {
        token: {
            type: DataTypes.STRING(400),
            notEmpty: true,
            allowNull: false,
        },
        browser: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        system: { type: DataTypes.STRING, allowNull: false },
        device: { type: DataTypes.STRING, allowNull: false },
        tokenDevice: { type: DataTypes.STRING, allowNull: false },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },

    {
        freezeTableName: true,
        sequelize,
        tableName: "tokenTable",
        timestamps: true,
        createdAt: "logInDate",
        paranoid: true,

        updatedAt: false,
        underscored: false,
    }
);

export default tokenTable;
