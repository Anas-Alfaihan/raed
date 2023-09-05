import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { removePic } from "../utils/compressImage.js";

//if want to store the image in folder and store in db then should use this

//***************  Create folders ****************** */
//? create the folder if not already exist
// ! create images folder if not exists
if (!fs.existsSync(path.join(path.resolve(), "images"))) {
    fs.mkdir(path.join(path.resolve(), "images"), (err) => {
        if (err) {
            return console.error(err);
        }
    });
}

// //create temp folder in images folder
// let tempPath = path.join(path.resolve(), '../images', 'temp');
// ///! create temp folder if not exists
// if (!fs.existsSync(tempPath)) {
//     //!create Temp
//     fs.mkdir(tempPath, (err) => {
//         if (err) {
//             return console.error(err);
//         }
//         //is done create success
//     });
// }
// //! create Images folder if not exists
// let imagesPath = path.join(path.resolve(), '../upload', 'images');
// if (!fs.existsSync(imagesPath)) {
//     // ! create Sorted folder
//     fs.mkdir(imagesPath, (err) => {
//         if (err) {
//             return console.error(err);
//         }
//         //is done create success
//     });
// }
//
// //!create mangers folder in image folder
// fs.mkdir(path.join(__dirname, '../upload/images', 'mangers'), (err) => {
//     if (err) {
//         return console.error(err)
//     }
//     //is done create success
// })
// //! create Users folder "Sorted/Users"
// fs.mkdir(path.join(__dirname, '../upload/images', 'users'), (err) => {
//     if (err) {
//         return console.error(err)
//     }
//     //is done create success
// })
// **********************************************
//*************** Disck Storage and multer ****************** */
//filter image
const fileFilterImage = (req, file, cb) => {
    //should type image like .jpg,.png, .jpeg
    // if (!file.originalname.match(/\.(jpg|png|jpeg)$/))
    // console.log(path.join(path.resolve(), `/images/${file.originalname}`));
    if (file.mimetype === "image/webp") {
        removePic(path.join(path.resolve(), `/images/${file.originalname}`));
        return cb(
            new Error("لا يمكن القيام بعملية رفع ملف من نوع webp"),
            false
        );
    } else if (
        file.mimetype.startsWith("image") ||
        file.mimetype === "application/octet-stream"
    ) {
    } else return cb(new Error("من فضلك قم برفع من نوع صورة فقط"), false);

    //otherwise return success
    //mean first args is undefined error ,second args mean
    cb(null, true);
};

//filter image
const fileFilterEvery = (req, file, cb) => {
    if (
        !file.originalname.match(
            /\.(jpg|png|jpeg|txt|pdf|docx|xlsx|pptx|gif|mp3|mp4|doc|xls|ppt|mov|avi)$/
        )
    )
        return cb(
            new Error(`
      :من فضلك قم برفع من الانواع التالية فقط
      .jpg,.png,.jpeg,.txt,.pdf,.docx,.xlsx,.pptx,.gif,.mp3,.mp4,.doc,.xls,.ppt,.mov,.avi`),
            false
        );
    //otherwise return success
    //mean first args is undefined error ,second args mean
    cb(null, true);
};

// config storage
export let configStorage = (pathStorage) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, pathStorage);
        },
        //config filename

        filename: function (req, file, cb) {
            let generateName = path.parse(file.originalname).name;

            if (file.mimetype != "image/webp") generateName = uuidv4();
            //name-date-extension
            cb(null, `${generateName}${path.extname(file.originalname)}`);
        },
    });

// crete multer with special storage path
export let createMulter = (storage) =>
    multer({
        storage,
        //to validate the picture
        limits: {
            //set the limited size ,measure bytes 1M byte=1e6
            fileSize: 5 * 1024 * 1024,

            //this mean the min is 3 Mega
        },
        //filter file with specific details
        fileFilter: fileFilterImage,
    });

export let createMulterEveryType = (storage) =>
    multer({
        storage,
        // limits: {
        //   fileSize: 30 * 1024 * 1024, // 30MB
        // },
        fileFilter: fileFilterEvery,
    });
