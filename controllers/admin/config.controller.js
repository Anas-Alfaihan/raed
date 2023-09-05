import { StatusCodes } from "http-status-codes";
import _ from "lodash";

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
let readFileJson = (myPath, callback) => {
    fs.readFile(path.join(path.resolve(), myPath), "utf8", (err, data) => {
        if (data.length === 0) return callback(null);
        const jsonData = JSON.parse(data);
        callback(jsonData);
    });
};
let writeFileJson = (myPath, data, callback) => {
    const jsonData = JSON.stringify(data);
    fs.writeFile(path.join(path.resolve(), myPath), jsonData, (err) => {
        if (err) {
            // console.error(err);

            return callback(err, null); // إرجاع الخطأ إلى الcallback والقيمة الثانية هي null
        } else {
            return callback(null, "Data written to file successfully"); // إرجاع النجاح إلى الcallback والقيمة الأولى هي null
        }
    });
};

export default {
    update: async (req, res, next) => {
        try {
            writeFileJson("/json/setting.json", req.body, (err, result) => {
                // if (err) throw Error(err);
            });
            res.status(StatusCodes.OK).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    get: async (req, res, next) => {
        try {
            readFileJson("/json/setting.json", (data) => {
                res.status(StatusCodes.OK).json({
                    success: true,
                    data,
                });
            });
        } catch (error) {
            next(error);
        }
    },
};
