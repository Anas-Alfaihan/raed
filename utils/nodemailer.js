import transporter from '../config/nodemailer.js';

import path from 'path';
import { removePic } from './helper.js';
import { StatusCodes } from 'http-status-codes';

//for check email
export let sendCheck = async (to, emailBody) => {
    try {
        let mailOptions = {
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            from: process.env.EMAIL,
            to,
            subject: 'Cheaper Company',
            html: emailBody,
            // attachments: [{ path: "", filename: "" }],
        };
        //for send email
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
export let sendEmail = async (req, res) => {
    try {
        let emailBody = `<h3>${req.body.text.trim()}</h3>`;

        let to = req.body.to.reduce((first, second) => first + ', ' + second);
        let mailOptions = {
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            from: process.env.EMAIL,
            to,
            subject: req.body.subject,
            html: emailBody,
        };
        if (req.files) {
            mailOptions.attachments = req.files.map((picture) => {
                return { path: picture.path, filename: picture.filename };
            });
        }

        //for send email
        await transporter.sendMail(mailOptions);
        //for remove the file from the local
        if (req.files)
            req.files.forEach((image) => {
                removePic(image.path);
            });
        res.status(StatusCodes.OK).send({
            success: true,
            msg: 'تمت عملية الارسال بنجاح',
        });
    } catch (error) {
        //remove the files if happen any error
        if (req.files)
            req.files.forEach((image) => {
                removePic(image.path);
            });
        res.status(StatusCodes.BAD_GATEWAY).send({
            success: false,
            error: error.message,
        });
    }
};
