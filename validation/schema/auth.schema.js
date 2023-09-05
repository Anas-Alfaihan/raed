import Joi from "joi";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
import { enumGender } from "../../utils/enums.js";
import moment from "moment/moment.js";
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
    tokenDevice: {
        "string.base": 'حقل "كلمة المرور" يجب أن يكون نصًا.',
        "string.empty": 'حقل "كلمة المرور" لا يجب أن يكون فارغًا.',
        "string.min":
            'حقل "كلمة المرور" يجب أن يحتوي على الحد الأدنى من 20  أحرف.',
        "string.max":
            'حقل "كلمة المرور" يجب أن يحتوي على الحد الأقصى لـ 400 حرفًا.',
        "any.required": 'حقل "كلمة المرور" مطلوب.',
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
    email: {
        "string.empty": 'حقل "البريد الإلكتروني" لا يجب أن يكون فارغًا.',
        "string.pattern.base":
            'حقل "البريد الإلكتروني" يجب أن يكون بتنسيق صحيح (example@gmail.com).',
        "any.required": 'حقل "البريد الإلكتروني" مطلوب.',
    },

    // store
    longitude: {
        "number.required": 'حقل "خط الطول" مطلوب.',
    },
    latitude: {
        "number.required": 'حقل "خط العرض" مطلوب.',
    },
    fromHour: {
        "number.integer": 'حقل "الساعة من" يجب أن يكون عدد صحيح.',
        "number.required": 'حقل "الساعة من" مطلوب.',
        "number.min": 'حقل "الساعة من" يجب أن تكون بين 1 و 12.',
        "number.max": 'حقل "الساعة من" يجب أن تكون بين 1 و 12.',
    },
    toHour: {
        "number.integer": 'حقل "الساعة إلى" يجب أن يكون عدد صحيح.',
        "number.required": 'حقل "الساعة إلى" مطلوب.',
        "number.min": 'حقل "الساعة إلى" يجب أن تكون بين 1 و 12.',
        "number.max": 'حقل "الساعة إلى" يجب أن تكون بين 1 و 12.',
    },
    category: {
        "string.min": 'حقل "الفئة" يجب أن يحتوي على الأقل حرفين.',
        "string.max": 'حقل "الفئة" يجب أن يحتوي على الأكثر 50 حرفًا.',
        "any.required": 'حقل "الفئة" مطلوب.',
        "any.custom": message,
    },
    locationText: {
        "string.min": 'حقل "نص الموقع" يجب أن يحتوي على الأقل حرف واحد.',
        "string.max": 'حقل "نص الموقع" يجب أن يحتوي على الأكثر 200 حرفًا.',
    },
    city: {
        "string.min": 'حقل "المدينة" يجب أن يحتوي على الأقل حرف واحد.',
        "string.max": 'حقل "المدينة" يجب أن يحتوي على الأكثر 50 حرفًا.',
        "any.required": 'حقل "المدينة" مطلوب.',
        "any.custom": message,
    },
    id: {
        "number.empty": 'حقل "المعرف" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "المعرف" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المعرف" يجب أن تكون قيمته على الأكثر 10,000,000.',
        "any.required": 'حقل "المعرف" مطلوب.',
    },
};

export const schema = {
    //login
    logIn: Joi.object({
        username: Joi.string()
            .trim()
            .pattern(/^[A-Za-z]+[a-zA-Z0-9\_\.]*$/)
            .min(3)
            .max(30)
            .required()
            .messages(errorMessages.username),
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
        tokenDevice: Joi.string()
            .required()
            .trim()
            .min(20)
            .max(400)
            .messages(errorMessages.tokenDevice),
    }),
    //sign in for normal user
    signInUser: Joi.object({
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
        phoneNumber: Joi.string()
            .trim()
            .required()
            .pattern(/^(09)(\d{8})$/)
            .messages(errorMessages.phoneNumber),
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
        tokenDevice: Joi.string()
            .required()
            .trim()
            .min(20)
            .max(400)
            .messages(errorMessages.tokenDevice),
    }),
    //sign in for manger store
    signInManger: Joi.object({
        //user info
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
            .messages(errorMessages.username),
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

        locationText: Joi.string()
            .min(1)
            .max(200)
            .allow(null)
            .messages(errorMessages.locationText)

            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            }),
        //store info
        nameStore: Joi.string()
            .required()
            .min(2)
            .max(50)
            .trim()
            .messages(errorMessages.name)
            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            }),

        longitude: Joi.number().required().messages(errorMessages.longitude),
        latitude: Joi.number().required().messages(errorMessages.latitude),

        city: Joi.string().required(),
        fromHour: Joi.number()
            .integer()
            .required()
            .min(1)
            .max(12)
            .messages(errorMessages.fromHour),
        toHour: Joi.number()
            .integer()
            .required()
            .min(1)
            .max(12)
            .messages(errorMessages.toHour),

        tokenDevice: Joi.string()
            .required()
            .trim()
            .min(20)
            .max(400)
            .messages(errorMessages.tokenDevice),
        category: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages(errorMessages.category)

            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            }),
    }),
};
