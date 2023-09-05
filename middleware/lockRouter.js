import { StatusCodes } from 'http-status-codes';
export let lockRouter = (permission) => {
    return async (req, res, next) => {
        try {
            let allBans = await ban_list_Pivot_user.findAll({
                where: { userId: req.user.id },
                attributes: [],
                include: {
                    model: ban_list,
                    attributes: { exclude: ['id', 'duration'] },
                },
                raw: true,
            });

            for (let ban of allBans) {
                let allRestrictions = JSON.parse(
                    ban['ban_list.restrictions']
                ).restrictions;
                if (allRestrictions.includes(permission))
                    throw Error(ban['ban_list.reason']);
            }
            next();
        } catch (err) {
            return res.status(StatusCodes.UNAUTHORIZED).send({
                success: false,
                error: err.message,
            });
        }
    };
};
