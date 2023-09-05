import { StatusCodes } from "http-status-codes";
export let errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let errorMessage = error.message || "Internal Server Error";

    // Send the error response to the client
    res.status(statusCode).json({
        success: false,
        error: errorMessage,
    });
};
