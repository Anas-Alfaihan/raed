import Filter from "bad-word-ar";
import { enumGender } from "../../../utils/enums.js";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
import Joi from "joi";
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
const errorMessages = {
    name: {
        "string.empty": 'حقل "الاسم" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "الاسم" يجب أن يحتوي على الأقل حرفين.',
        "string.max": 'حقل "الاسم" يجب أن يحتوي على الأكثر 50 حرفًا.',
        "any.required": 'حقل "الاسم" مطلوب.',
        "any.custom": message,
    },
    gender: {
        "any.only": 'حقل "الجنس" يجب أن يكون ذكرًا أو أنثى.',
        "any.required": 'حقل "الجنس" مطلوب.',
    },
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
    password: {
        "string.empty": 'حقل "كلمة المرور" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "كلمة المرور" يجب أن تحتوي على الأقل 8 أحرف.',
        "string.max": 'حقل "كلمة المرور" يجب أن تحتوي على الأكثر 50 حرفًا.',
        "any.required": 'حقل "كلمة المرور" مطلوب.',
    },
    // params
    id: {
        "number.base": 'حقل "المعرف" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون رقمًا صحيحًا.',
        "number.max": 'حقل "المعرف" يجب أن يكون أقل من أو يساوي 1000000.',
        "any.required": 'حقل "المعرف" مطلوب.',
    },
    roleId: {
        "number.base": 'حقل "roleId" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "roleId" يجب أن يكون رقمًا صحيحًا.',
        "number.max": 'حقل "roleId" يجب أن يكون أقل من أو يساوي 1000000.',
        "any.required": 'حقل "roleId" مطلوب.',
    },
};
export let schema = {
    body: {
        modify: Joi.object({
            name: Joi.string()
                .required()
                .min(2)
                .max(50)
                .trim()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.name),
            gender: Joi.string()

                .valid(...Object.values(enumGender))
                .required()
                .messages(errorMessages.gender),
            email: Joi.string()
                .trim()
                .required()
                .pattern(/^[a-zA-Z0-9]+[a-zA-Z0-9._]*@gmail\.com$/)
                .messages(errorMessages.email),
            phoneNumber: Joi.string()
                .trim()
                .required()
                .pattern(/^(09)(\d{8})$/)
                .messages(errorMessages.phoneNumber),
            username: Joi.string()
                .trim()
                .pattern(/^[A-Za-z]+[a-zA-Z0-9\_\.]*$/)
                .min(3)
                .max(30)
                .required()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.username),
            password: Joi.string()
                .required()
                .min(8)
                .max(50)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.password),
            roleId: Joi.number()
                .integer()
                .max(1e7)
                .required()
                .messages(errorMessages.roleId),
        }),
    },
    params: Joi.object({
        id: Joi.number()
            .integer()
            .max(1e7)
            .required()
            .messages(errorMessages.id),
    }),
    query: {},
};
