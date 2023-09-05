import Joi from "joi";
import Filter from "bad-word-ar";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";
import { enumStateOffer, enumTypeOffer } from "../../utils/enums.js";
const errorMessages = {
    id: {
        "number.empty": 'حقل "المعرف" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "المعرف" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "المعرف" يجب أن تكون قيمته على الأكثر 10,000,000.',
        "any.required": 'حقل "المعرف" مطلوب.',
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
    size: {
        "number.base": 'حقل "الحجم" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "الحجم" يجب أن يكون رقمًا صحيحًا.',
        "number.min": 'حقل "الحجم" يجب أن يكون على الأقل 1.',
        "number.max": 'حقل "الحجم" يجب أن يكون أقل من أو يساوي 1000.',
        "any.required": 'حقل "الحجم" مطلوب.',
    },
    search: {
        "string.base": 'حقل "search" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "search" يجب أن يكون أقل من أو يساوي 200.',
    },
    page: {
        "number.base": 'حقل "الصفحة" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "الصفحة" يجب أن يكون رقمًا صحيحًا.',
        "number.min": 'حقل "الصفحة" يجب أن يكون على الأقل 1.',
        "number.max": 'حقل "الصفحة" يجب أن يكون أقل من أو يساوي 10000.',
        "any.required": 'حقل "الصفحة" مطلوب.',
    },
    reason: {
        "string.empty": 'حقل "السبب" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "السبب" يجب أن يحتوي على الأقل حرف واحد.',
        "string.max": 'حقل "السبب" يجب أن يحتوي على الأكثر 200 حرف.',
        "any.required": 'حقل "السبب" مطلوب.',
    },
    evaluate: {
        "number.empty": 'حقل "التقيم" لا يجب أن يكون فارغًا.',
        "number.integer": 'حقل "التقيم" يجب أن يكون قيمته عدد صحيح.',
        "number.min": 'حقل "التقيم" يجب أن تكون قيمته على الأقل 1.',
        "number.max": 'حقل "التقيم" يجب أن تكون قيمته على الأكثر 10.',
        "any.required": 'حقل "التقيم" مطلوب.',
    },
    type: {
        "any.only": 'حقل "الجنس" يجب أن يكون spam أو evaluate',
        "any.required": 'حقل "الجنس" مطلوب.',
    },
    typeOffer: {
        "any.only": 'حقل "الجنس" يجب أن يكون مجاني او مدفوع ',
        "any.required": 'حقل "نوع العرض" مطلوب.',
    },
    state: {
        "any.only": 'حقل "الجنس" يجب أن يكون عادي , تم الاهداء ',
        "any.required": 'حقل "الحالة" مطلوب.',
    },
};

export const schema = {
    body: {
        spamEvaluation: Joi.object({
            reasonSpam: Joi.string()
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

            evaluate: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .messages(errorMessages.evaluate),
        }),
    },
    params: {
        id: Joi.object({
            id: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.id),
        }),
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
    },
    query: {
        pagination: Joi.object({
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

            state: Joi.object()
                // عادي , تم الاهداء    //
                .valid(...Object.values(enumStateOffer))
                .required()
                .messages(errorMessages.state),
            typeOffer: Joi.string()
                .valid(...Object.values(enumTypeOffer))
                .messages(errorMessages.typeOffer),
            search: Joi.string().max(100).messages(errorMessages.search),

            categoryIds: Joi.array().items(
                Joi.number()
                    .integer()
                    .min(1)
                    .max(1e7)
                    .required()
                    .messages(errorMessages.id)
            ),
        }),
        type: Joi.object({
            type: Joi.object()
                .valid(...Object.values({ spam: "spam", evaluate: "evaluate" }))
                .messages(errorMessages.type),
            offerUserId: Joi.number()
                .integer()
                .min(1)
                .max(1e7)
                .required()
                .messages(errorMessages.id),
        }),

        gift: Joi.object({
            offerId: Joi.number()
                .integer()
                .min(1)
                .max(1e7)
                .required()
                .messages(errorMessages.id),
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
