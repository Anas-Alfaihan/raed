import Joi from "joi";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
const errorMessages = {
    id: {
        "number.empty": 'حقل "المعرف" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "المعرف" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المعرف" يجب أن تكون قيمته على الأكثر 10,000,000.',
        "any.required": 'حقل "المعرف" مطلوب.',
    },
    reason: {
        "string.empty": 'حقل "السبب" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "السبب" يجب أن يحتوي على الأقل حرف واحد.',
        "string.max": 'حقل "السبب" يجب أن يحتوي على الأكثر 200 حرف.',
        "any.required": 'حقل "السبب" مطلوب.',
    },
    show: {
        "array.empty": 'حقل "العرض" لا يجب أن يكون فارغًا.',
        "array.min": 'حقل "العرض" يجب أن يحتوي على الأقل عنصر واحد.',
        "array.max": 'حقل "العرض" يجب أن يحتوي على الأكثر 150 عنصر.',
        "any.required": 'حقل "العرض" مطلوب.',
    },
    action: {
        "array.empty": 'حقل "الإجراء" لا يجب أن يكون فارغًا.',
        "array.min": 'حقل "الإجراء" يجب أن يحتوي على الأقل عنصر واحد.',
        "array.max": 'حقل "الإجراء" يجب أن يحتوي على الأكثر 150 عنصر.',
        "any.required": 'حقل "الإجراء" مطلوب.',
    },
    duration: {
        "number.empty": 'حقل "المدة" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "المدة" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "المدة" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المدة" يجب أن تكون قيمته على الأكثر 10,000.',
        "any.required": 'حقل "المدة" مطلوب.',
    },
};
export const schema = {
    body: {
        modify: Joi.object({
            reason: Joi.string()
                .min(1)
                .max(200)
                .required()
                .trim()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.reason),
            restrictions: Joi.object({
                show: Joi.array()
                    .items(
                        Joi.string()
                            .trim()
                            .min(2)
                            .max(150)
                            .custom((value, helpers) => {
                                if (
                                    filterAr.check(value) ||
                                    filterEn.check(value)
                                )
                                    return helpers.message(message);
                                else return value;
                            })
                    )
                    .required()
                    .messages(errorMessages.show),
                action: Joi.array()
                    .items(
                        Joi.string()
                            .trim()
                            .min(1)
                            .max(150)
                            .custom((value, helpers) => {
                                if (
                                    filterAr.check(value) ||
                                    filterEn.check(value)
                                )
                                    return helpers.message(message);
                                else return value;
                            })
                    )
                    .messages(errorMessages.action)
                    .required(),
            }).required(),
            duration: Joi.number()
                .integer()
                .min(1)
                .max(1e4)
                .required()
                .messages(errorMessages.duration),
        }),
    },
    params: Joi.object({
        id: Joi.number()
            .integer()
            .required()
            .min(1)
            .max(1e3)
            .messages(errorMessages.id),
    }),
    query: {},
};
