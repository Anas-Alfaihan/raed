import { StatusCodes } from "http-status-codes";

let throwError = (message, res) => {
    return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message,
    });
};

export default (app) => {
    // check if content type is valid
    app.use((req, res, next) => {
        // console.log(req.query);
        let messageError =
            "You can't send empty body with this methods, Please send content body --> 'application/json' 😜😁";
        if (
            (req.method === "POST" ||
                req.method === "PUT" ||
                req.method === "PATCH") &&
            (!req.params || !req.query)
        ) {
            // if the content tpe is multipart/form-date then allow to access
            if (
                req.headers["content-type"].toString().split(";")[0] ===
                "multipart/form-data"
            );
            else if (
                Object.keys(req.body).length === 0 ||
                req.headers["content-type"].toString() !== "application/json"
            )
                // if not have an attribute then throw Error ,or if content type is not application/json
                return throwError(messageError, res);
        }
        next();
    });

    // check if bad json
    app.use((error, req, res, next) => {
        let message = `Please don't send bad JSON for server 😜😁`;
        if (error) throwError(message, res);
        else next();
    });
};
