import { StatusCodes } from "http-status-codes";
import rateLimit from "express-rate-limit";

export let limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers,
    statusCode: StatusCodes.TOO_MANY_REQUESTS, //status code response
    skipSuccessfulRequests: false,
    message: {
        success: false,
        message:
            "Too many requests from this IP, please try again after 15 minutes :) ",
        // data: {},
    },
});
