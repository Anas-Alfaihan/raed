import dotenv from "dotenv";

dotenv.config({ path: `../.env` });
import { StatusCodes } from "http-status-codes";

export const verifyEmail = async (req, res, next) => {
    try {
        if (req.role.id != 2) {
            if (
                JSON.parse(req.user.additionalInformation).verify.email ===
                false
            ) {
                throw new Error(
                    "الرجاء تاكيد الايميل ثم المتابعة في الدخول الى الموقع"
                );
            }
        }
        next();
    } catch (err) {
        return res.status(StatusCodes.CONFLICT).json({
            success: false,
            error: err.message,
        });
    }
};
