import Joi from "joi";
import {
    enumActive,
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
    type: {
        "string.base": 'حقل "type" يجب أن يكون سلسلة نصية.',
        "any.only": 'قيمة "type" غير صالحة.',
        "any.required": 'حقل "type" مطلوب.',
    },
    subscribe: {
        "boolean.base": 'حقل "الاشتراك" يجب أن يكون منطقيًا.',
        "any.required": 'حقل "الاشتراك" مطلوب.',
    },

    gender: {
        "any.only": 'حقل "الجنس" يجب أن يكون ذكرًا أو أنثى.',
        "any.required": 'حقل "الجنس" مطلوب.',
    },
    active: {
        "string.base": 'حقل "active" يجب أن يكون سلسلة نصية.',
        "any.only": 'قيمة "active" غير صالحة.',
        "any.required": 'حقل "active" مطلوب.',
    },
    category: {
        "string.base": 'حقل "الفئة" يجب أن يكون سلسلة نصية.',
        "string.custom": message,
        "any.required": 'حقل "الفئة" مطلوب.',
    },
    city: {
        "string.base": 'حقل "city" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "city" يجب أن يكون أقل من أو يساوي 50.',
    },
    title: {
        "string.base": 'حقل "title" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "title" يجب أن يكون أقل من أو يساوي 50.',
    },
    message: {
        "string.base": 'حقل "message" يجب أن يكون سلسلة نصية.',
        "any.custom": message,
        "number.max": 'حقل "message" يجب أن يكون أقل من أو يساوي 50.',
    },
};

export const schema = {
    body: Joi.object({
        title: Joi.string()
            .max(50)
            .required()
            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            })
            .messages(errorMessages.city),
        message: Joi.string()
            .max(50)
            .required()
            .custom((value, helpers) => {
                if (filterAr.check(value) || filterEn.check(value))
                    return helpers.message(message);
                else return value;
            })
            .messages(errorMessages.city),
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
        send: Joi.object({
            type: Joi.string()
                .valid(...Object.values({ users: "users", manager: "manager" }))
                .required()
                .messages(errorMessages.type),
            gender: Joi.string()
                .valid(...Object.values(enumGender))
                .messages(errorMessages.gender),

            active: Joi.string()
                .valid(...Object.values(enumActive))
                .messages(errorMessages.active),
            categories: Joi.array().items(
                Joi.string()
                    .trim()
                    .max(30)
                    .custom((value, helpers) => {
                        if (filterAr.check(value) || filterEn.check(value))
                            return helpers.message(message);
                        else return value;
                    })
                    .message(errorMessages.category)
            ),
            city: Joi.string()
                .max(50)
                .custom((value, helpers) => {
                    if (filterAr.check(value) || filterEn.check(value))
                        return helpers.message(message);
                    else return value;
                })
                .messages(errorMessages.city),

            subscribe: Joi.boolean().messages(errorMessages.subscribe),
        }),
    },
};
