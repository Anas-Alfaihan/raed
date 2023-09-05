import { StatusCodes } from 'http-status-codes';

export let access = (action) => {
    return (req, res, next) => {
        try {
            let allActions = JSON.parse(req.user.role.data).action;
            if (!allActions.includes(action))
                throw Error('Access Denied / Unauthorized request');
            next();
        } catch (err) {
            return res.status(StatusCodes.UNAUTHORIZED).send({
                success: false,
                error: err.message,
            });
        }
    };
};
