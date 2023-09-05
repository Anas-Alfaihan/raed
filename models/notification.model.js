import dotenv from 'dotenv';
dotenv.config({ path: `../.env` });
import { sequelize } from '../utils/connect.js';
import { DataTypes, Model } from 'sequelize';
import { enumShowNotification } from '../utils/enums.js';
class notification extends Model {}

notification.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "title can't be empty here ",
                },
                set(value) {
                    this.setDataValue('title', value.trim());
                },
            },
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "message  can't be empty here ",
                },
            },
            set(value) {
                this.setDataValue('message', value.trim());
            },
        },
        avatar: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        showType: {
            type: DataTypes.ENUM,
            values: Object.values(enumShowNotification),
            allowNull: false,
        },
    },
    {
        freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
        sequelize, // We need to pass the connection instance
        tableName: 'notification',
        timestamps: false,
        // updatedAt: false,
    }
);
export default notification;
