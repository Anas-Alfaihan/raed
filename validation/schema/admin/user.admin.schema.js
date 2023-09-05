import Joi from "joi";
import {
    enumGender,
    enumTakenAddOfferOrNot,
    enumTypeOffer,
} from "../../../utils/enums.js";
import moment from "moment";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";

const errorMessages = {
    getOfferUser: {
        userId: {
            "number.base": 'حقل "userId" يجب أن يكون رقمًا.',
            "number.integer": 'حقل "userId" يجب أن يكون رقمًا صحيحًا.',
            "number.min": 'حقل "userId" يجب أن يكون أكبر من أو يساوي 1.',
            "number.max": 'حقل "userId" يجب أن يكون أقل من أو يساوي 1 000 000.',
            "any.required": 'حقل "userId" مطلوب.',
        },
        id: {
            "number.base": 'حقل "id" يجب أن يكون رقمًا.',
            "number.integer": 'حقل "id" يجب أن يكون رقمًا صحيحًا.',
            "number.min": 'حقل "id" يجب أن يكون أكبر من أو يساوي 1.',
            "number.max": 'حقل "id" يجب أن يكون أقل من أو يساوي 1 000 000.',
            "any.required": 'حقل "id" مطلوب.',
        },
        statePaid: {
            "string.base": 'حقل "statePaid" يجب أن يكون سلسلة نصية.',
            "any.only": 'قيمة "statePaid" غير صالحة.',
            "any.required": 'حقل "statePaid" مطلوب.',
        },
        type: {
            "string.base": 'حقل "type" يجب أن يكون سلسلة نصية.',
            "any.only": 'قيمة "type" غير صالحة.',
            "any.required": 'حقل "type" مطلوب.',
        },
    },
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
    birthday: {
        "date.base": 'حقل "birthday" يجب أن يكون تاريخًا.',
        "date.format": 'حقل "birthday" يجب أن يكون بتنسيق تاريخ صالح.',
        "date.max": 'حقل "birthday" يجب أن يكون تاريخًا قبل اليوم.',
        "date.min": 'حقل "birthday" يجب أن يكون تاريخًا بعد "1970-01-01".',
        "any.required": 'حقل "birthday" مطلوب.',
    },
    size: {
        "number.base": 'حقل "الحجم" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "الحجم" يجب أن يكون رقمًا صحيحًا.',
        "number.min": 'حقل "الحجم" يجب أن يكون على الأقل 1.',
        "number.max": 'حقل "الحجم" يجب أن يكون أقل من أو يساوي 1000.',
        "any.required": 'حقل "الحجم" مطلوب.',
    },
    page: {
        "number.base": 'حقل "الصفحة" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "الصفحة" يجب أن يكون رقمًا صحيحًا.',
        "number.min": 'حقل "الصفحة" يجب أن يكون على الأقل 1.',
        "number.max": 'حقل "الصفحة" يجب أن يكون أقل من أو يساوي 10000.',
        "any.required": 'حقل "الصفحة" مطلوب.',
    },
    type: {
        "boolean.base": 'حقل "النوع" يجب أن يكون منطقيًا.',
        "any.required": 'حقل "النوع" مطلوب.',
    },
    category: {
        "string.base": 'حقل "الفئة" يجب أن يكون سلسلة نصية.',
        "string.custom": message,
        "any.required": 'حقل "الفئة" مطلوب.',
    },

    search: {
        "string.base": 'حقل "search" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "search" يجب أن يكون أقل من أو يساوي 200.',
    },
    id: {
        "number.base": 'حقل "المعرف" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون رقمًا صحيحًا.',
        "number.max":
            'حقل "المعرف" يجب أن يكون أقل من أو يساوي  يجب أن يكون أقل من أو يساوي 1 000 000.',
        "any.required": 'حقل "المعرف" مطلوب.',
    },
    active: {
        "boolean.base": 'حقل "النوع" يجب أن يكون منطقيًا.',
        "any.required": 'حقل "النوع" مطلوب.',
    },
};

export const schema = {
    body: {
        userInfo: Joi.object({
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
            birthday: Joi.date()
                .required()
                .max(moment())
                .min(moment("1970-01-01"))
                .messages(errorMessages.birthday),
            username: Joi.string()
                .trim()
                .pattern(/^[A-Za-z]+[a-zA-Z0-9\_\.]*$/)
                .min(3)
                .max(30)
                .required()
                .messages(errorMessages.username),
            category: Joi.array()
                .items(
                    Joi.string()
                        .trim()
                        .max(30)
                        .required()
                        .custom((value, helpers) => {
                            if (filterAr.check(value) || filterEn.check(value))
                                return helpers.message(message);
                            else return value;
                        })
                        .message(errorMessages.category)
                )
                .min(3)
                .required(),
            avatar: Joi.string().empty(Joi.allow(null)),
            password: Joi.string()
                .empty(Joi.allow(null))
                .min(8)
                .max(50)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.password),
        }),
    },
    params: {
        idJust: Joi.object({
            id: Joi.number()
                .integer()
                .min(1)
                .max(1e7)
                .required()
                .messages(errorMessages.id),
        }),
    },
    query: {
        limited: Joi.object({
            size: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e3)
                .messages(errorMessages.size),
            page: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e4)
                .messages(errorMessages.page),
        }),
        unblock: Joi.object({
            userId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.id),
            ids: Joi.array()
                .items(
                    Joi.number()
                        .integer()
                        .required()
                        .min(1)
                        .max(1e7)
                        .messages(errorMessages.id)
                )
                .min(1)
                .required(),
        }),
        block: Joi.object({
            userId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.id),
            blockId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1000)
                .messages(errorMessages.id),
        }),
        filter: Joi.object({
            size: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e3)
                .messages(errorMessages.size),
            page: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e4)
                .messages(errorMessages.page),
            search: Joi.string()
                .max(200)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.search),
            gender: Joi.string()
                .valid(...Object.values(enumGender))
                .messages(errorMessages.gender),
            blockId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1000)
                .messages(errorMessages.id),
            active: Joi.boolean().messages().messages(errorMessages.active),
        }),
        getOfferUser: Joi.object({
            size: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e3)
                .messages(errorMessages.size),
            page: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e4)
                .messages(errorMessages.page),
            userId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.getOfferUser.userId),
            statePaid: Joi.string()
                .valid(
                    //   "تم اخذ", "لم تتم الاخذ",
                    ...Object.values(enumTakenAddOfferOrNot)
                )
                .messages(errorMessages.getOfferUser.statePaid),

            type: Joi.string()
                //   "مجاني", "مدفوع",
                .valid(...Object.values(enumTypeOffer))
                .messages(errorMessages.getOfferUser.type),
            search: Joi.string()
                .max(200)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.search),
        }),
        storeInfoForOfferUser: Joi.object({
            userId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.getOfferUser.userId),
            id: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.getOfferUser.id),
        }),
    },
};
