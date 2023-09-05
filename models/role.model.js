import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import moment from "moment";
import user from "./user.model.js";

class role extends Model {}

role.init(
    {
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "لا يمكنك ترك حقل الاسم فارغ ",
                },
            },
            unique: {
                args: true,
                msg: "اسم الدور موجود مسبقا في القائمة ",
            },
            set(value) {
                this.setDataValue("name", value.trim());
            },
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        sequelize,
        timestamps: false,
        tableName: "role",
        hooks: {
            beforeDestroy: async (roleInfo) => {
                await user.destroy({
                    where: { roleId: roleInfo.id },
                    force: true,
                });
            },
        },
    }
);
export default role;
