import dotenv from "dotenv";
dotenv.config({ path: `../.env` });
import { sequelize } from "../utils/connect.js";
import { DataTypes, Model } from "sequelize";
import { bcrypt } from "../utils/bcrypt.js";
import moment from "moment";
import { enumGender } from "../utils/enums.js";
// import notification from "./notification.model.js";
// import blockUser from "./blockUser.model.js";
// import { token } from "morgan";
// import tokenTable from "./tokenTable.model.js";
// import giftedOffers from "./giftedOffers.model.js";
// import users_Pivot_category from "./usersCategory.js";
// import store from "./store.model.js";
// import offersUser from "./offersUser.model.js";
class user extends Model {}

user.init(
    {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "لا يمكنك ترك الاسم فارغ ",
                },
            },
            set(value) {
                this.setDataValue("name", value.trim());
            },
        },
        gender: {
            type: DataTypes.ENUM,
            values: Object.values(enumGender),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: {
                args: true,
                msg: "رقم الهاتف موجود ل حساب اخر ",
            },
            is: /^(09)(\d{8})$/,
            validate: {
                notEmpty: {
                    msg: "لا يمكن ترك رقم الهاتف فارغ",
                },
            },
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isDate: {
                    msg: "تاريخ الميلاد غير صحيح",
                },
            },
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: {
                args: true,
                msg: "اسم المستخدم موجود لحساب اخر ",
            },
            validate: {
                notEmpty: {
                    msg: "لايمكنك ترك اسم المستخدم فارغ ",
                },
                len: {
                    args: [3, 30],
                    msg: "لا يمكن ن يكون اسم المستخدم اقل من 3 محارف او اكثر من 30 محرف ",
                },
            },
            set(value) {
                this.setDataValue("username", value.trim().toLowerCase());
            },
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "لايمكن ان يكون كلمة السر فارغة ",
                },
            },
        },

        avatar: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        /* 
    additionalInformation = {
        settings: {},
        accountCash: {},
        verify: { email: false, phone: true },
    };
 */
        additionalInformation: {
            type: DataTypes.JSON,
            allowNull: false,
        },

        //If account is disable
        disableAt: {
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
        sequelize, // We need to pass the connection instance
        tableName: "user",
        timestamps: true,
        paranoid: true, //to set the delateAt and mean disable account
        deletedAt: "disableAt",
        updatedAt: false,
        //! Triggers
        hooks: {
            beforeCreate: (user) => {
                //check if password is content the username
                if (user.password.includes(user.username))
                    throw new Error(
                        `\n Can't password is content  username :( \n  Your password : ${user.password} \n  Your username : ${user.username}`
                    );

                //check if the username  is same tha password
                if (user.userName === user.password)
                    throw new Error("Can't be username is same password ");

                //bcrypt password
                user.password = bcrypt(user.password);
                // console.log(await bcrypt(user.password));
            },
            beforeUpdate: (user) => {
                if (user.password) {
                    //use to check if their are password
                    //bcrypt password
                    user.password = bcrypt(user.password);
                }
            },

            beforeDestroy: async (userInfo) => {
                // await notification.destroy({
                //     where: { userId: userInfo.id },
                //     force: true,
                // });
                // await blockUser.destroy({
                //     where: { userId: userInfo.id },
                //     force: true,
                // });
                // await tokenTable.destroy({
                //     where: { userId: userInfo.id },
                //     force: true,
                // });
                // await users_Pivot_category.destroy({
                //     where: { userId: userInfo.id },
                //     force: true,
                // });
                // await giftedOffers.destroy({
                //     force: true,
                //     where: { sendId: userInfo.id },
                // });
                // await store.destroy({
                //     force: true,
                //     where: { userId: userInfo.id },
                // });
                // await offersUser.destroy({
                //     where: { userId: userInfo.id },
                //     raw: true,
                // });
            },
        },
    }
);

export default user;
