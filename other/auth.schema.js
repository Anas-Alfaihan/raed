const Joi = require("joi");
module.exports.schema = {
  //login
  logIn: Joi.object({
    username: Joi.string()
      .trim()
      .pattern(/[a-zA-Z]+[a-zA-Z0-9\_\.]*$/)
      .min(3)
      .max(30)
      .required(),
    password: Joi.string().required().min(8).max(50),
  }),
  //sign in for normal user
  signInUser: Joi.object({
    name: Joi.string().required().min(2).max(50).trim(),
    gender: Joi.boolean().default(true).required(),
    category: Joi.array().items(Joi.string().trim().min(3)).required(),
    email: Joi.string()
      .trim()
      .pattern(/[a-zA-Z0-9\_\.]+(@gmail\.com)$/)
      .allow(null),
    phoneNumber: Joi.string()
      .trim()
      .required()
      .pattern(/^(09)(\d{8})$/),
    birthday: Joi.date().required(),
    username: Joi.string()
      .trim()
      .pattern(/[a-zA-Z]+[a-zA-Z0-9\_\.]*$/)
      .min(3)
      .max(30)
      .required(),
    password: Joi.string().required().min(8).max(50),
    avatar: Joi.string().allow(null),
  }),
  //sign in for manger store
  signInManger: Joi.object({
    //user info
    name: Joi.string().required().min(2).max(50).trim(),
    motherName: Joi.string().trim().required().min(2).max(50),
    fatherName: Joi.string().trim().required().min(2).max(50),
    familyName: Joi.string().trim().required().min(2).max(50),
    gender: Joi.boolean().required(),
    email: Joi.string()
      .trim()
      .pattern(/[a-zA-Z]+[a-zA-Z0-9\_\.]*(@gmail\.com)$/)
      .allow(null),
    phoneNumber: Joi.string()
      .trim()
      .required()
      .pattern(/^(09)(\d{8})$/),

    username: Joi.string()
      .trim()
      .pattern(/^[A-Za-z]+[a-zA-Z0-9\_\.]*$/)
      .min(3)
      .max(30)
      .required(),
    password: Joi.string().required().min(8).max(50),

    //store info
    nameStore: Joi.string().required().min(3).max(50).trim(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    fromHour: Joi.number().required().min(1).max(12),
    toHour: Joi.number().required().min(1).max(12),
    category: Joi.string().required().trim(),
    ssn: Joi.string()
      .trim()
      .pattern(/^(04010)(\d{6})$/)
      .required(),
    //بتفق عليهن مع الفرونت
    country: Joi.string().required().min(2).max(50).trim(),
    constraint: Joi.string().required().min(2).max(50).trim(),
    StoreStory: Joi.string().allow(null),
    avatar1: Joi.string().allow(null),
    avatar2: Joi.string().allow(null),
    avatar: Joi.string().allow(null),
  }),
};
