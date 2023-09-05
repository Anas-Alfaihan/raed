import Joi from "joi";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
const errorMessages = {
    name: {
        "string.empty": 'حقل "الاسم" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "الاسم" يجب أن يحتوي على الأقل حرفين.',
        "string.max": 'حقل "الاسم" يجب أن يحتوي على الأكثر 50 حرفًا.',
        "any.required": 'حقل "الاسم" مطلوب.',
        "any.custom": message,
    },
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
    avatar_store: {
        "string.empty": 'حقل "صورة المتجر" لا يجب أن يكون فارغًا.',
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
    avatar: {
        "string.empty": 'حقل "الصورة" لا يجب أن يكون فارغًا.',
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
    body: Joi.object({
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
        avatar_store: Joi.string().allow(null),
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
        city: Joi.string()
            .min(1)
            .max(50)
            .required()
            .messages(errorMessages.city)

            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            }),
        avatar: Joi.string().empty(Joi.allow(null)),
    }),
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
        verify: Joi.object({
            qr: Joi.string()
                .required()
                .min(1)
                .max(400)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                }),
        }),
    },
};
