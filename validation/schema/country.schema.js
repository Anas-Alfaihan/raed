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
    name: {
        "string.empty": 'حقل "الاسم" لا يجب أن يكون فارغًا.',
        "string.base": 'حقل "الاسم" يجب أن يكون نصًا.',
        "string.min": 'حقل "الاسم" يجب أن يحتوي على الأقل حرف واحد.',
        "string.max": 'حقل "الاسم" يجب أن يحتوي على الأكثر 75 حرفًا.',
    },
};
export const schema = {
    body: Joi.object({
        name: Joi.string()
            .required()
            .trim()
            .min(1)
            .max(75)
            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            })
            .messages(errorMessages.name),
    }),
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
