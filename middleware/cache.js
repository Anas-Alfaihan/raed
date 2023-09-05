import nodeCache from "../utils/cache.js";
import { StatusCodes } from "http-status-codes";
import url from "url";

export let cache = (duration) => {
    return (req, res, next) => {
        try {
            res.cache = nodeCache;
            // check if request method is GET
            if (req.method !== "GET") return next();
            // console.log(url.parse(req.originalUrl));
            // console.log(url.parse(req.originalUrl).pathname);

            // check if request key is exists in cache
            const key = req.originalUrl;
            const cachedResponse = nodeCache.get(key);

            if (cachedResponse)
                return res.status(StatusCodes.OK).send({
                    success: true,
                    data: cachedResponse,
                });
            else {
                res.originalSend = res.send;
                res.send = (body) => {
                    // to execute the real code and then store result in node cache
                    res.originalSend(body);
                    nodeCache.set(key, JSON.parse(body).data, duration);
                };
                next();
            }
        } catch (error) {
            return res.status(StatusCodes.UNAUTHORIZED).send({
                success: false,
                error: err.message,
            });
        }
    };
};
