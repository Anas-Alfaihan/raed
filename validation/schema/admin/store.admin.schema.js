import Filter from "bad-word-ar";
import {
    enumGender,
    enumTakenAddOfferOrNot,
    enumType,
    enumTypeOffer,
} from "../../../utils/enums.js";

const filterAr = new Filter("ar");
const filterEn = new Filter("en");
import Joi from "joi";
let message = "بعض الحقول تحتوي على كلمات نابية، الرجاء التقيد باداب النص";

const errorMessages = {
    name: {
        "string.base": 'حقل "الاسم" يجب أن يكون سلسلة نصية.',
        "string.empty": 'حقل "الاسم" لا يجب أن يكون فارغًا.',
        "string.min": 'حقل "الاسم" يجب أن يحتوي على الأقل 2 أحرف.',
        "string.max": 'حقل "الاسم" يجب أن يحتوي على الحد الأقصى لـ 50 حرفًا.',
        "any.required": 'حقل "الاسم" مطلوب.',
    },
    id: {
        "number.base": 'حقل "المعرف" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "المعرف" يجب أن يكون رقمًا صحيحًا.',
        "number.max":
            'حقل "المعرف" يجب أن يكون أقل من أو يساوي  يجب أن يكون أقل من أو يساوي 1 000 000.',
        "any.required": 'حقل "المعرف" مطلوب.',
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
    city: {
        "string.base": 'حقل "المدينة" يجب أن يكون سلسلة نصية.',
        "string.custom": message,
        "any.required": 'حقل "المدينة" مطلوب.',
    },

    // params
    "params.idJust.id": {
        "number.base": 'حقل "id" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "id" يجب أن يكون رقمًا صحيحًا.',
        "number.max":
            'حقل "id" يجب أن يكون أقل من أو يساوي  يجب أن يكون أقل من أو يساوي 1 000 000.',
        "any.required": 'حقل "id" مطلوب.',
    },
    // query
    "query.all.size": {
        "number.base": 'حقل "size" يجب أن يكون رقمًا.',
        "number.integer": 'حقل "size" يجب أن يكون رقمًا صحيحًا.',
        "number.min": 'حقل "size" يجب أن يكون أكبر من أو يساوي 1.',
        "number.max": 'حقل "size" يجب أن يكون أقل من أو يساوي 1000.',
        "any.required": 'حقل "size" مطلوب.',
    },

    "query.all.type": {
        "boolean.base": 'حقل "type" يجب أن يكون منطقيًا.',
        "any.required": 'حقل "type" مطلوب.',
    },
    "query.all.category": {
        "string.base": 'حقل "category" يجب أن يكون سلسلة نصية.',
    },
    "query.all.city": {
        "string.base": 'حقل "city" يجب أن يكون سلسلة نصية.',
    },

    search: {
        "string.base": 'حقل "search" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "search" يجب أن يكون أقل من أو يساوي 200.',
    },
    ids: {
        "array.base": 'حقل "ids" يجب أن يكون مصفوفة.',
        "array.min": 'حقل "ids" يجب أن يحتوي على عنصر واحد على الأقل.',
        "number.base": 'قيمة "ids" يجب أن تكون رقمًا.',
        "number.integer": 'قيمة "ids" يجب أن تكون رقمًا صحيحًا.',
        "number.min": 'قيمة "ids" يجب أن تكون أكبر من أو تساوي 1.',
        "number.max": 'قيمة "ids" يجب أن تكون أقل من أو تساوي 10000.',
        "any.required": 'حقل "ids" مطلوب.',
    },
    users: {
        storeId: {
            "number.base": 'حقل "storeId" يجب أن يكون رقمًا.',
            "number.integer": 'حقل "storeId" يجب أن يكون رقمًا صحيحًا.',
            "number.min": 'حقل "storeId" يجب أن يكون أكبر من أو يساوي 1.',
            "number.max":
                'حقل "storeId" يجب أن يكون أقل من أو يساوي 1 000 000.',
            "any.required": 'حقل "storeId" مطلوب.',
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
};

export const schema = {
    body: Joi.object({
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
    }),
    params: {
        idJust: Joi.object({
            id: Joi.number()
                .integer()
                .max(1e7)
                .required()
                .messages(errorMessages.id),
        }).messages(errorMessages.id),
    },
    query: {
        all: Joi.object({
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
            type: Joi.boolean().required().messages(errorMessages.type),
            category: Joi.string()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return boolean.message(message);
                    else return value;
                })
                .messages(errorMessages.category),
            city: Joi.string()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.city),
            search: Joi.string()
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.search),
        }),
        limit: Joi.object({
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
            storeId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .message(errorMessages.id),

            type: Joi.string()
                //       evaluate ,spam,
                .valid(...Object.values(enumType))
                .required()
                .messages(errorMessages.type),
        }),
        ids: Joi.object({
            ids: Joi.array()
                .items(Joi.number().integer().min(1).max(1e7))
                .min(1)
                .required()
                .messages(errorMessages.ids),
        }),
        users: Joi.object({
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
            storeId: Joi.number()
                .integer()
                .required()
                .min(1)
                .max(1e7)
                .messages(errorMessages.users.storeId),
            statePaid: Joi.string()
                .valid(
                    //   "تم اخذ", "لم تتم الاخذ",
                    ...Object.values(enumTakenAddOfferOrNot)
                )
                .messages(errorMessages.users.statePaid),

            type: Joi.string()
                //   "مجاني", "مدفوع",
                .valid(...Object.values(enumTypeOffer))
                .messages(errorMessages.users.type),
            search: Joi.string()
                .max(200)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.search),
        }),
    },
};
