import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { role, user } from "../../models/index.js";
import { token } from "morgan";
import tokenTable from "../../models/tokenTable.model.js";
export default {
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    add: async (req, res, next) => {
        try {
            if (req.params.roleId < 5)
                throw Error("رقم الصلاحية المدخلة غير صحيحة");
            let roleInfo = await role.findOne({
                raw: true,
                attributes: ["id"],
                where: { id: req.body.roleId },
            });
            if (!roleInfo) throw Error("الصلاحية المدخلة غير صحيحة");

            let response = await user.create({
                ...req.body,
                roleId: roleInfo.id,
                additionalInformation: JSON.stringify({
                    settings: {},
                    accountCash: {},
                    verify: {
                        email: false,
                        phone: false,
                    },
                }),
            });
            res.status(StatusCodes.CREATED).json({
                success: true,
                data: response.id,
                msg: `تم إنشاء بنجاح`,
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @employee
     * @private
     * @method PUT
     * @work update employee
     */
    update: async (req, res, next) => {
        try {
            if (req.body.roleId < 5)
                throw Error("رقم الصلاحية المدخلة غير صحيحة");

            let myUser = await user.findOne({
                attributes: ["id", "roleId"],
                where: { id: req.params.id, roleId: { [Op.gte]: 5 } },
            });
            if (!myUser) throw Error("رقم الموظف غير صحيح");

            if (req.role.id !== 1 && req.body.id === 1)
                throw Error("غير مصرح لك اجراء عمليةالتعديل");
            let roleInfo = await role.findOne({
                raw: true,
                attributes: ["id"],
                where: {
                    id: req.body.roleId,
                },
            });

            if (!roleInfo) throw Error("الصلاحية المدخلة غير صحيحة");

            if (myUser.roleId != req.body.roleId) {
                // delete every token login for this user
                await tokenTable.destroy({ where: { userId: myUser.id } });
            }

            await user.update(
                {
                    ...req.body,
                    roleId: roleInfo.id,
                },
                {
                    where: { id: req.params.id },
                }
            );

            res.status(StatusCodes.OK).json({
                success: true,
                msg: `تم التحديث بنجاح`,
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @employee
     * @private
     * @method DELETE
     * @work delete employee
     */

    delete: async (req, res, next) => {
        try {
            if (+req.params.id === 1)
                throw Error("لا يمكنك القيام بعملية الحذف ل الحساب الافتراضي");

            let deleteEmployee = await user.findOne({
                attributes: ["id"],
                where: {
                    id: +req.params.id,
                },
            });
            if (!deleteEmployee) throw Error("المستخدم المختار غير موجود");

            await deleteEmployee.destroy({ force: true });
            res.status(StatusCodes.OK).json({
                success: true,
                msg: "تمت عملية الحذف بنجاح",
            });
        } catch (error) {
            next(error);
        }
    },

    /*
     * @employee
     * @private
     * @method GET
     * @work all employee
     */
    getAll: async (req, res, next) => {
        try {
            let allInfo = await user.findAll({
                paranoid: false,
                attributes: [
                    "id",
                    "name",
                    "gender",
                    "email",
                    "phoneNumber",
                    "username",
                    "avatar",
                ],
                raw: true,
                where: {
                    roleId: { [Op.or]: [{ [Op.gte]: 5 }] },
                },
                include: { model: role, required: true, attributes: ["id"] },
            });
            // allInfo = allInfo.map((roleInfo) => {
            //     return { ...roleInfo ,"role.name":undefined};
            // });
            res.status(StatusCodes.OK).json({ success: true, data: allInfo });
        } catch (error) {
            next(error);
        }
    },
};
