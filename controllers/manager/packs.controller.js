import path from "path";
import { StatusCodes } from "http-status-codes";
import { Op, Sequelize } from "sequelize";
import _ from "lodash";

// MODELS
import { store, packsStore, packs } from "../../models/index.js";
import { readSetting } from "../../utils/helper.js";

export default {
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */

    getPacks: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error(
                    "لا يمكن الاشتراك بباقة قبل ان يكون المتجر مقبول من قبل المدير"
                );

            let result = { active: {}, ended: [] };
            let all = await packsStore.findAll({
                attributes: [
                    "createdAt",
                    "discount",
                    "cost",
                    "deletedAt",
                    "id",
                ],
                paranoid: false,
                raw: true,
                include: [
                    {
                        model: packs,
                        required: true,
                        attributes: ["name", "duration"],
                        required: true,
                        paranoid: false,
                    },
                    {
                        model: store,
                        attributes: [],
                        required: true,
                        paranoid: false,
                        where: { userId: req.user.id },
                    },
                ],
            });

            all.forEach((record) => {
                if (record.deletedAt) result.ended.push(record);
                else result.active = record;
            });
            res.status(StatusCodes.OK).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */

    //choose one of the packs for store
    choosePack: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error(
                    "لا يمكن الاشتراك بباقة قبل ان يكون المتجر مقبول من قبل المدير"
                );
            if (req.query.packId == 1)
                throw Error(
                    "لا يمكنك القيام باجراء عملية الاشتراك ب الباقة المجانية"
                );
            let storeInfo = await store.findOne({
                attributes: ["id"],
                raw: true,
                where: { userId: req.user.id },
            });
            let myPack = await packs.findByPk(req.query.packId, {
                attributes: ["id", "price"],
                raw: true,
            });
            if (!myPack) throw Error("الباقة المدخل غير صحيح ");

            if (
                await packsStore.findOne({
                    attributes: ["id"],
                    where: { storeId: storeInfo.id },
                })
            )
                throw Error(
                    "انت مشترك في باقة من قبل لايمكنك ان تشترك في اكثر من باقة في نفس الوقت الرجاء الانتظار ل انتهار مدة الباقة او الغائها ثم قم ب اعادة الاشتراك في باقة جديدة "
                );

            // ! check if has 5 pack not taken then

            let packedTaken = await packsStore.findAll({
                raw: true,
                attributes: [
                    [Sequelize.fn("count", Sequelize.col("id")), "count"],
                ],
                paranoid: false,
                where: { takenGift: false, storeId: storeInfo.id },
            });

            let msg = "";

            let config = readSetting();
            if (packedTaken[0].count === config.GiftCard) {
                // gift it free pack

                await packsStore.create({
                    storeId: storeInfo.id,
                    packId: 1,
                    discount: config.discountFree,
                    cost: 0,
                    takenGift: true,
                });
                await packsStore.update(
                    { takenGift: true },
                    { paranoid: false, where: { storeId: storeInfo.id } }
                );
                msg =
                    "تم الاشتراك باقة هدية مجانية بنجاح دون اجراء اي عملية خصم من الحساب ";
            } else {
                // !شيك اول اذا في مصاري تكفي بلحساب
                // ! يجب ان تتم عملية التحويل المصاري من حساب المدير المحل الى حسب باسل

                await packsStore.create({
                    storeId: storeInfo.id,
                    packId: +req.query.packId,
                    discount: +req.query.discount,
                    cost: myPack.price,
                    takenGift: false,
                });
                msg = "تم الاشتراك في الباقة بنجاح";
            }

            res.status(StatusCodes.OK).json({
                success: true,
                msg,
            });
        } catch (error) {
            next(error);
        }
    },
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    disablePack: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error(
                    "لا يمكن الاشتراك بباقة قبل ان يكون المتجر مقبول من قبل المدير"
                );

            let packDel = await packsStore.findOne({
                where: { id: req.params.id },

                attributes: ["id"],
            });
            if (!packDel)
                throw Error(
                    "الباقة المطلوبة محذوفة مسبقا او انك لم تشترك فيها "
                );

            await packDel.destroy({});
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تم الغاء الاشتراك بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
    //choose one of the packs for store
    update: async (req, res, next) => {
        try {
            if (req.user.roleId !== 4)
                throw Error(
                    "لا يمكن التعامل بباقة قبل ان يكون المتجر مقبول من قبل المدير"
                );

            let storeInfo = await store.findOne({
                where: { userId: req.user.id },
                attributes: ["id"],
                raw: true,
            });

            let myPack = await packsStore.findOne({
                attributes: ["id"],
                raw: true,
                where: { id: +req.query.id, storeId: storeInfo.id },
            });
            if (!myPack)
                throw Error("الباقة المختار غير موجودة او انها قد انتهت");

            await packsStore.update(
                {
                    discount: +req.query.discount,
                },
                {
                    where: {
                        id: +req.query.id,
                    },
                }
            );
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تم عملية التحيث الباقة بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },
};
