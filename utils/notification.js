import dotenv from "dotenv";
dotenv.config({
    path: "../.env",
});
import FCM from "fcm-node";
const serverKey = process.env.FIREBASE_KEY;
const fcm = new FCM(serverKey);

export default {
    send: async (token, notificationData, next) => {
        const message = {
            //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token,
            notification: {
                title: notificationData.title,
                body: notificationData.body,
                image: notificationData.image,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                // id: "1",
                // status: "done",
            },
        };

        fcm.send(message, function (err, response) {
            if (err) {
                next(err);
            } else {
                return response;
            }
        });
    },
    sendMultiple: async (tokens, notificationData, next) => {
        // send to multiple tokens

        const message = {
            registration_ids: tokens,
            notification: {
                title: notificationData.title,
                body: notificationData.message,
                image: notificationData.image,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                // id: "1",
                // status: "done",
            },
        };

        fcm.send(message, function (err, response) {
            if (err) {
                next(err);
            } else {
                return response;
            }
        });
    },
};
