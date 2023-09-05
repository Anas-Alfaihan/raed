import Joi from "joi";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";

const errorMessages = {
    email: {
        "string.empty": 'حقل "البريد الإلكتروني" لا يجب أن يكون فارغًا.',
        "string.pattern.base":
            'حقل "البريد الإلكتروني" يجب أن يكون بتنسيق صحيح (example@gmail.com).',
        "any.required": 'حقل "البريد الإلكتروني" مطلوب.',
    },
    phoneNumber: {
        "string.empty": 'حقل "رقم الهاتف" لا يجب أن يكون فارغًا.',
        "string.pattern.base":
            'حقل "رقم الهاتف" يجب أن يكون بتنسيق صحيح (09xxxxxxxx).',
        "any.required": 'حقل "رقم الهاتف" مطلوب.',
    },
    username: {
        "string.empty": 'حقل "اسم المستخدم" لا يجب أن يكون فارغًا.',
        "string.pattern.base":
            'حقل "اسم المستخدم" يجب أن يحتوي على أحرف وأرقام فقط.',
        "string.min": 'حقل "اسم المستخدم" يجب أن يحتوي على الأقل 3 أحرف.',
        "string.max": 'حقل "اسم المستخدم" يجب أن يحتوي على الأكثر 30 حرفًا.',
        "any.required": 'حقل "اسم المستخدم" مطلوب.',
        "any.custom": message,
    },
};
export const schema = {
    body: {
        check_email: Joi.object({
            email: Joi.string()
                .trim()
                .required()
                .pattern(/^[a-zA-Z0-9]+[a-zA-Z0-9._]*@gmail\.com$/)
                .messages(errorMessages.email),
        }),
    },
    params: {},
    query: {
        check_phone: Joi.object({
            phone: Joi.string()
                .trim()
                .required()
                .pattern(/^(09)(\d{8})$/)
                .messages(errorMessages.phoneNumber),
        }),
        check_username: Joi.object({
            username: Joi.string()
                .trim()
                .pattern(/^[A-Za-z]+[a-zA-Z0-9\_\.]*$/)
                .min(3)
                .max(30)
                .required()
                .messages(errorMessages.username),
        }),
    },
};
