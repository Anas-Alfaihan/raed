import _ from "lodash";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
//MODELS
import { store, user, block, blockUser } from "../../models/index.js";

export default {
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    create: async (req, res, next) => {
        try {
            let ban = await block.findOne({
                attributes: ["id"],
                where: {
                    reason: req.body.reason.trim(),
                },
            });
            if (ban)
                throw Error(
                    "نفس السبب موجود سابقا الرجاء القيام بتغيرالسبب ثم اجراء عملية الاضافة "
                );
            ///لازم امنعو من انو يدخل نوع حظر ل تسجيل الدخول التعديل على حسابه
            let dataJson = JSON.stringify({
                show: req.body.restrictions.show,
                action: req.body.restrictions.action,
            });
            // console.log(dataJson);
            await block.create({
                reason: req.body.reason,
                restrictions: dataJson,
                duration: req.body.duration,
            });
            res.status(StatusCodes.CREATED).json({
                success: true,
                msg: `تم إنشاء بنجاح`,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    update: async (req, res, next) => {
        try {
            let ban = await block.findByPk(req.params.id, {
                attributes: ["id"],
            });
            if (!ban) throw Error("رقم غير صحيح ");

            ban = await block.findOne({
                attributes: ["id"],

                where: {
                    reason: req.body.reason.trim(),
                    id: { [Op.not]: req.params.id },
                },
            });
            if (ban)
                throw Error(
                    "السبب موجود سابقا الرجاء القيام بعملية تغير ثم اجراء عملية الاضافة"
                );

            let dataJson = JSON.stringify({
                show: req.body.restrictions.show,
                action: req.body.restrictions.action,
            });
            await block.update(
                {
                    name: req.body.reason.trim(),
                    restrictions: dataJson,
                    duration: req.body.duration,
                },
                { where: { id: req.params.id } }
            );
            res.status(StatusCodes.OK).json({
                success: true,
                msg: `تمت عملية التحديث بنجاح`,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */
    remove: async (req, res, next) => {
        try {
            const ban = await block.findByPk(req.params.id, {
                attributes: ["id"],
            });
            if (!ban) throw Error("رقم غير صحيح ");

            if (req.params.id <= 5)
                throw Error(
                    "لا يمكنك حذف احدى الصلاحيات الاساسية الموجودة في النظام "
                );

            await ban.destroy({ force: true });
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @auth controllers
     * public
     * @method POST
     * @work sign in as manger store
     */

    getAll: async (req, res, next) => {
        try {
            let data = await block.findAll({ raw: true });
            data = data.map((blockInfo) => {
                return {
                    id: blockInfo.id,
                    reason: blockInfo.reason,

                    restrictions: blockInfo.restrictions,
                    duration: blockInfo.duration,
                };
            });

            res.status(StatusCodes.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
