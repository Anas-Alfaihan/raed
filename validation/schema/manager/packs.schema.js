import Joi from "joi";
import { readSetting } from "../../../utils/helper.js";
let setting = readSetting();
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
const errorMessages = {
    name: {
        "string.empty": 'حقل "الاسم" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "الاسم" يجب أن يحتوي على الأقل حرفين.',
        "string.max": 'حقل "الاسم" يجب أن يحتوي على الأكثر 60 حرفًا.',
        "any.required": 'حقل "الاسم" مطلوب.',
        "any.custom": message,
    },
    duration: {
        "number.empty": 'حقل "المدة" لا يجب أن يكون فارغًا.',
        "number.min": 'حقل "المدة" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المدة" يجب أن تكون قيمته على الأكثر 10,000.',
        "any.required": 'حقل "المدة" مطلوب.',
    },
    price: {
        "number.empty": 'حقل "السعر" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "السعر" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "السعر" يجب أن تكون قيمته على الأقل 0.',
        "any.required": 'حقل "السعر" مطلوب.',
    },
    id: {
        "number.empty": 'حقل "المعرف" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "المعرف" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المعرف" يجب أن تكون قيمته على الأكثر 10,000,000.',
        "any.required": 'حقل "المعرف" مطلوب.',
    },
    packId: {
        "number.empty": 'حقل "معرف " لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "معرف " يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "معرف " يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "معرف " يجب أن تكون قيمته على الأكثر 10,000,000.',
        "any.required": 'حقل "معرف " مطلوب.',
    },
    discount: {
        "number.empty": 'حقل "الخصم" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "الخصم" يجب أن يكون قيمته عدد صحيح.',
        "number.min": `حقل "الخصم" يجب أن تكون قيمته على الأقل ${setting.discountFree}`,
        "any.required": 'حقل "المعرف" مطلوب.',
    },
};
export const schema = {
    body: Joi.object({
        name: Joi.string()
            .required()
            .min(1)
            .max(60)
            .trim()
            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            })
            .messages(errorMessages.name),
        duration: Joi.number()
            .min(1)
            .max(1e4)
            .required()
            .messages(errorMessages.duration),
        price: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages(errorMessages.price),
    }),
    params: Joi.object({
        id: Joi.number()
            .integer()
            .min(1)
            .max(1e7)
            .required()
            .messages(errorMessages.id),
    }),
    query: {
        choose: Joi.object({
            packId: Joi.number()
                .integer()
                .min(1)
                .max(1e7)
                .required()
                .messages(errorMessages.packId),
            discount: Joi.number()
                .integer()
                .required()
                .min(setting.discountFree)
                .max(100)
                .messages(errorMessages.discount),
        }),
        update: Joi.object({
            id: Joi.number()
                .integer()
                .min(1)
                .max(1e7)
                .required()
                .messages(errorMessages.packId),
            discount: Joi.number()
                .integer()
                .required()
                .min(setting.discountFree)
                .max(100)
                .messages(errorMessages.discount),
        }),
    },
};
