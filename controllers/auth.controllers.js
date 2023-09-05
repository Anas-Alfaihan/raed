import { Op, Transaction } from "sequelize";
import { StatusCodes } from "http-status-codes";
import moment from "moment";
import useragent from "useragent";

//UTILS
import { compare } from "../utils/bcrypt.js";
import { createToken } from "../utils/jwt.js";

//CONTROLLER
import controlStore from "./manager/stores.controllers.js";
import controlUser from "./users.controllers.js";

// MODELS
import {
    user as users,
    role,
    token as tokenTable,
    category,
    usersCategory,
    store,
} from "../models/index.js";

import { sequelize } from "../utils/connect.js";
import { readSetting } from "../utils/helper.js";
import { resolve } from "path";
/*
///basic roles in system :
  1 Admin 
  2 User
  3 Manger new 
  4 Manger saved
  5 manger country 
#this roles can't any one edit or delete them 
#but other role can edit on it 
*/

let setToken = async (req, id, transaction) => {
    let agent = useragent.parse(req.headers["user-agent"]);
    const token = createToken(req, { id });
    await tokenTable.create(
        {
            token,
            browser: agent.family,
            tokenDevice: req.body.tokenDevice.trim(),
            system: agent.os.toString(),
            device: agent.device.toString(),
            userId: id,
            expiresAt: moment().add(90, "days").format("YYYY-MM-DD h:mm:ss"),
        },
        { transaction }
    );

    // res.cookie("cheaper-token", token, {
    //   //90 day
    //   //day * hour * minute * second * mile second
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    //   httpOnly: true,
    // });
    // res.cookie("cheaper-checkToken", true, {
    //   //day * hour * minute * second * mile second
    //   maxAge: 90 * 24 * 60 * 60 * 1000,
    // });
    return token;
};
export default {
    /*
     * @auth
     * @public
     * @method POST
     * @work sign up user
     */
    signUpUser: async (req, res, next) => {
        try {
            let resultCheck = await controlUser.validationCategory(
                req.body.category,
                null
            );
            if (resultCheck.error) throw Error(error);

            //create user
            var newUser = null;

            let token = null;
            await sequelize.transaction(async (transaction) => {
                newUser = await users.create(
                    {
                        //because role id for user is 2
                        roleId: 2,
                        ...req.body,
                        additionalInformation: process.env.USER_SETTINGS,
                    },
                    { transaction }
                );

                resultCheck.array = resultCheck.array.map((e) => {
                    return { userId: newUser.id, categoryId: e.categoryId };
                });

                token = await setToken(req, newUser.id, transaction);
            });

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: {
                    token,
                },
            });
            ///create interests
            await usersCategory.bulkCreate([...resultCheck.array]);
        } catch (error) {
            //return error to user
            next(error);
        }
    },
    /*
     * @auth
     * @public
     * @method POST
     * @work sign up manager
     */
    signUpManger: async (req, res, next) => {
        try {
            var manager = null;
            let token = null;
            let myCategory = await category.findOne({
                attributes: ["id"],
                where: { name: req.body.category.trim() },
                raw: true,
            });
            if (!myCategory) throw Error("صنف المتجر غير صحيح");

            await sequelize.transaction(async (transaction) => {
                manager = await users.create(
                    {
                        //because role id for new manger is 3 ,after accepted from the admin  then change role (for allow to manger to modify offer )
                        roleId: 3,
                        ...req.body,
                        additionalInformation: process.env.USER_SETTINGS,
                    },
                    { transaction }
                );

                token = await setToken(req, manager.id, transaction);
            });
            res.status(StatusCodes.CREATED).send({
                success: true,
                data: {
                    token,
                },
            });
            store.create({
                ...req.body,
                categoryId: myCategory.id,
                userId: manager.id,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth
     * @public
     * @method POST
     * @work login
     */
    login: async (req, res, next) => {
        try {
            const myInfo = await users.findOne({
                attributes: ["disableAt", "id", "password"],
                raw: true,

                where: { username: req.body.username.trim() },
            });

            if (!myInfo) throw Error("اسم المستخدم غير صحيح");

            const validPassword = await compare(
                req.body.password,
                myInfo.password
            );
            if (!validPassword) throw Error("كلمة المرور غير صحيحة ");

            let token = await setToken(req, myInfo.id);

            res.status(StatusCodes.OK).send({
                success: true,
                data: {
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth
     * @public
     * @method GET
     * @work logout
     */
    logout: async (req, res, next) => {
        try {
            //delete token access
            let agent = useragent.parse(req.headers["user-agent"]);

            let token = await tokenTable.findOne({
                attributes: ["id"],
                where: {
                    browser: agent.family,
                    device: agent.device.toString(),
                    userId: req.user.id,
                },
            });

            if (!token) throw Error("هذا الحساب مسجل خروج من هذا المتصفح ");

            token.destroy({});

            // res.clearCookie('cheaper-token');
            // res.cookie('cheaper-checkToken', false, {});
            res.status(StatusCodes.OK).send({
                success: true,
                msg: "تم تسجيل الخروج بنجاح ",
            });
        } catch (error) {
            next(error);
        }
    },
};
