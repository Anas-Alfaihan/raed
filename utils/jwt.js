import dotenv from "dotenv";
dotenv.config({ path: `./.env` });
import Jwt from "jsonwebtoken";
import moment from "moment";

export let verifyToken = (token) => Jwt.verify(token, process.env.SECRET_KEY);

export let createToken = (req, payload) =>
    Jwt.sign(
        {
            ...payload,
            ipAddress: req.ip,
            startTime: new Date(),
            expiresAt: moment().add(90, "days").calendar(),
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
export let createQROffer = (payload) =>
    Jwt.sign(
        {
            ...payload,
            startTime: new Date(),
            expiresAt: moment().add(1, "days"),
        },
        process.env.SECRET_KEY_OFFER,
        {
            expiresIn: "1d",
        }
    );
export let verifyQROffer = (token) =>
    Jwt.verify(token, process.env.SECRET_KEY_OFFER);

export let checkTokenValidity = (token) => {
    const now = Date.now();
    if (now > token.expiresAt)
        // توكن منتهي الصلاحية
        return false;

    // توكن ساري المفعول
    return true;
};
