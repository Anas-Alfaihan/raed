import dotenv from "dotenv";
dotenv.config({ path: `./.env` });
import { Sequelize } from "sequelize";
import { sequelize as sequelizeConnect } from "../utils/connect.js";
export default async () => {
    let connectionUrl = `mysql://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT_DB}`;
    // let connectionUrl2 = `mysql://u9ycx1we58tiekbb:KC9XlW8X43OT3v83p21w@bd5y8bf5secuo0lxf3l7-mysql.services.clever-cloud.com:3306/bd5y8bf5secuo0lxf3l7`;

    // create sequelize connection with mysql
    const sequelize = new Sequelize(connectionUrl, {
        dialect: "mysql",
        logging: false, // تعطيل الرسائل التي تظهر في الطرفية
    });

    // ! create database if not exists
    let resultCreate = await sequelize.query(
        `CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`
    );
    if (resultCreate[0].affectedRows)
        console.log("successfully created database ✅");

    //! check if found table with relationship
    let check = null;
    try {
        check = await sequelize.query(
            `select * from  ${process.env.DATABASE}.user limit 1`
        );
    } catch (error) {
        if (!check) {
            // ! if not found user table then create table with relationship
            await import(`../models/index.js`);
            sequelizeConnect
                .sync({ force: true })
                .then(async () => {
                    let defaultData = await import("./default_data.js");
                    await defaultData.default().then((_) => {
                        console.log(
                            "successfully created relationships with tables ✅✅"
                        );
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
};

/*import dotenv from "dotenv";

dotenv.config({ path: `./.env` });
import { Sequelize } from "sequelize";
import { sequelize as sequelizeConnect } from "../utils/connect.js";

export default () => {
    // create sequelize connection with mysql
    const sequelize = new Sequelize(
        `mysql://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT_DB}`,
        {
            dialect: "mysql",
            logging: false, // تعطيل الرسائل التي تظهر في الطرفية
        }
    );
    //! create database cheaper if not exists
    sequelize
        .query(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`)
        .then(async (result) => {
            if (result[0].affectedRows) {
                // if affectRows is above the 0 then now is created new database now
                //  import every model
                await import(`../models/index.js`);

                let defaultData = await import("./default_data.js");
                await sequelizeConnect.sync({ force: true }).then(async () => {
                    await defaultData.default(sequelizeConnect).then((_) => {
                        console.log(
                            "successfully ✅ create cheaper database ✅✅"
                        );
                    });
                });
            }
        })
        .catch((err) => {
            console.error(
                `Error creating database: ${process.env.DATABASE} `,
                err
            );
        });
};
 */
