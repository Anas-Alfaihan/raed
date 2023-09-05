import _ from "lodash";
import { StatusCodes } from "http-status-codes";
import os from "os";

//MODELS
import { user, category } from "../models/index.js";
import { Op } from "sequelize";
import { Worker } from "worker_threads";
import path from "path";
export default {
    /*
     * @employee
     * @private
     * @method POST
     * @work add new employee
     */
    checkUsername: async (req, res, next) => {
        try {
            // في حال كان موجود يقوم ب اعادة جميع الاسشخاص يلي اسمهن هيك
            let usernameCheck = await user.findAll({
                raw: true,
                paranoid: false,
                attributes: ["avatar", "name", "username"],
                where: { username: { [Op.like]: `%${req.query.username}%` } },
            });
            if (!usernameCheck) throw Error("اسم المستخدم غير موجود");

            res.status(StatusCodes.OK).json({
                success: true,
                data: usernameCheck,
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

    checKPhoneNumber: async (req, res, next) => {
        try {
            // Get the number of CPU cores
            const cpuCount = os.cpus().length;

            console.log(`Number of CPU cores: ${cpuCount}`);

            const worker = new Worker(
                path.join(path.resolve(), "./controllers/worker.js"),
                { workerData: { thread_count: 4 } }
            );
            worker.on("message", (data) => {
                res.status(StatusCodes.OK).json({ success: true, data });
            });
            worker.on("error", (error) => {
                res.status(404).json({ success: false, error });
            });
            // if (
            //     await user.findOne({
            //         where: { phoneNumber: req.query.phone.trim() },
            //         attributes: ["id"],
            //         raw: true,
            //         paranoid: false,
            //     })
            // )
            //     throw Error("رقم الهاتف موجود سابقا");
            // res.status(StatusCodes.OK).json({ success: true });
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
    checKEmail: async (req, res, next) => {
        try {
            if (
                await user.findOne({
                    where: { email: req.body.email.trim() },
                    attributes: ["id"],
                })
            )
                throw Error("لايميل موجود سابقا");

            res.status(StatusCodes.OK).json({ success: true });
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
    allCategory: async (req, res, next) => {
        try {
            let data = await category.findAll({
                raw: true,
            });
            // res.attachment(resolve("/images/static/logo_600x600.webp"));
            res.status(StatusCodes.OK).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
