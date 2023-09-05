import cron from 'node-cron';
import { token as tokenTable } from '../models/index.js';
import { Op } from 'sequelize';

export let cleanTokens = async () => {
    let task = cron.schedule('1-3 1 0 * * * *', async () => {
        // لازم كلشي فانكسن بدي ساولها جدولة وحسيت انها بدها تاخ كتير داتا وهيك بقلبها sql

        let expiredTokens = await tokenTable.findAll({
            attributes: ['id'],
            where: {
                expiresAt: {
                    [Op.lt]: new Date(),
                },
            },
        });
        await Promise.all(expiredTokens.map((record) => record.destroy()));
    });
    task.start();
};

export let emailSchedule = async () => {
    // let task = cron.schedule("1-3 1 0 * * * *", async () => {
    //   let expiredTokens = await tokenTable.findAll({
    //     attributes: ["id"],
    //     where: {
    //       expiresAt: {
    //         [Op.lt]: new Date(),
    //       },
    //     },
    //   });
    //   await Promise.all(expiredTokens.map((record) => record.destroy()));
    // });
    // task.start();
};
