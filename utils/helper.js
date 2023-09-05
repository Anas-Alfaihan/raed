import fs from "fs";
import path from "path";
import { configStorage, createMulter } from "../config/multer.js";

import sharp from "sharp";
import moment from "moment";
export let moveFile = (file, dir2) => {
    var f = path.basename(file);
    var dest = path.resolve(dir2, f);

    fs.rename(file, dest, (err) => {
        if (err) throw Error(err);
    });
    return dest;
};

export let removeFolder = (type, id) => {
    try {
        let folder = path.join(__dirname, `../upload/images/${type}/${id}`);
        // console.log(folder);
        if (fs.existsSync(folder)) {
            fs.rmSync(folder, { recursive: true, force: true });

            // var rimraf = require("rimraf");
            // // rimraf(folder, () => {
            // //   console.log("done");
            // // });
            // rimraf.sync(folder);
            // how to remove folder if exists ?
        }
    } catch (error) {
        return { err: error.message };
    }
};

export let removePic = (myPath) => {
    if (fs.existsSync(myPath)) {
        fs.unlink(myPath, (err) => {
            // myError.error = err;
            return err;
        });
    }
};

export let removeAvatars = (req) => {
    //already all this picture is found
    //delete every avatar if found
    let showError = (err) => {
        if (err) {
            return err;
        }
    };
    if (req.files) {
        if (req.files.avatar1 && fs.existsSync(req.files.avatar1[0].path))
            fs.unlink(req.files.avatar1[0].path, showError);
        if (req.files.avatar2 && fs.existsSync(req.files.avatar2[0].path))
            fs.unlink(req.files.avatar2[0].path, showError);
        if (req.files.avatar && fs.existsSync(req.files.avatar[0].path))
            fs.unlink(req.files.avatar[0].path, showError);
        if (req.files.StoreStory)
            req.files.StoreStory.forEach((element) => {
                // console.log(fs.readFileSync(element.path));
                if (fs.existsSync(element.path))
                    fs.unlink(element.path, showError);
            });
    }
    if (req.file) removePic(req.file.path);
};

// how to remove folder if exists in path ?

export let configFolder = (type, id) => {
    // ! create folder with id
    try {
        let myPath = path.join(
            __dirname,
            `../upload/images/${type}`,
            id.toString()
        );
        let myError = {};
        if (!fs.existsSync(myPath)) {
            fs.mkdir(myPath, (err) => {
                if (err) myError.error = err;
            });
            if (myError.error) return myError.error;
        }
        return myPath;
    } catch (error) {
        return { err: error.message };
    }
};
export let sortAvatars = (req, type, id) => {
    try {
        if (type == "users" || type == "mangers") {
            let myPath = configFolder(type, id);
            if (myPath.err) throw Error(myPath.err);
            // console.log(myPath);
            moveFile(req.file.path, myPath);
            // console.log();
            req.file.path = path.join(myPath, req.file.filename);
        } else if (type == "signup") {
            //manger sing up
            let myPath = configFolder("mangers", id);
            if (myPath.err) throw Error(myPath.err);

            // //! move avatar
            // moveFile(req.files.avatar[0].path, myPath);
            // req.files.avatar[0].path = path.join(
            //   myPath,
            //   req.files.avatar[0].filename
            // );

            ///! move avatars [0] identity
            moveFile(req.files[0].path, myPath);
            req.files[0].path = path.join(myPath, req.files[0].filename);
            //! move avatars[1] identity
            myPath;
            moveFile(req.files[1].path, myPath);
            req.files[1].path = path.join(myPath, req.files[1].filename);

            // //! move store story
            // for (let i = 0; i < req.files.StoreStory.length; i++) {
            //   moveFile(req.files.StoreStory[i].path, myPath);
            //   req.files.StoreStory[i].path = path.join(
            //     myPath,
            //     req.files.StoreStory[i].filename
            //   );
            // }
        }
        return true;
    } catch (error) {
        return { error };
    }
};

const IMAGE_PATH = path.join(path.resolve(), "images");

export let configUpload = async (fieldUpload, type) => {
    try {
        let upload = null;
        if (type === "multi") {
            upload = createMulter(configStorage(IMAGE_PATH));
            //if we want more then 3 , just set number here
            upload = upload.array(fieldUpload, 3);
        } else {
            upload = createMulter(configStorage(IMAGE_PATH));
            upload = upload.single(fieldUpload);
        }
        return upload;
    } catch (error) {
        return { error };
    }
};
// export let readConfig = (callback) => {
//     fs.readFile(
//         path.join(path.resolve(), "/json/config.json"),
//         "utf8",
//         (err, data) => {
//             if (data.length === 0) return callback(null);
//             const jsonData = JSON.parse(data);
//             callback(jsonData);
//         }
//     );
// };
export let readSetting = () => {
    try {
        const data = fs.readFileSync(
            path.join(path.resolve(), "/json/setting.json"),
            "utf8"
        );
        if (data.length === 0) return null;
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        // console.error(error);
        return null;
    }
};

import { v4 as uuidv4 } from "uuid";
export async function convertToJpeg(inputFilename, req) {
    const outputFilename = `${uuidv4()}.jpg`;
    let metadata = await sharp(inputFilename).metadata();
    await sharp(inputFilename)
        .jpeg({ quality: 40 }) // تحديد جودة الصورة المضغوطة
        .toFile(outputFilename, async (err, info) => {
            if (err) {
                console.log(err);
            } else {
                moveFile(
                    path.resolve() + "\\" + outputFilename,
                    path.resolve() + "\\" + "images"
                );

                removePic(req.file.path);
            }
        });
    return outputFilename;
}

export let emailBody = (code, link) => {
    return `<h3>الكود المرسل الخاص بعملية التفعيل ${code}</h3>

                    <h2>علما انه سينتهي صلاحية الرمز المدخلة بعد مرور 10 دقائق من الان </h2>
                        <h1>${link}</h1>
                    <h1>الوقت الان </h1><h1>${moment().format(
                        "YYYY-MM-DD h:mm:ss"
                    )}</h1>
    `;
};
/*
export let configUpload = async (req, fieldUpload, type) => {
    try {
        if (req.user) {
            let storeInfo = await store.findOne({
                where: { userId: req.user.id },
            });

            if (type == 'update account') {
                //if now update the account then set this pic in the temp folder
                let pathTemp = path.join(__dirname, TEMP_PATH);
                let upload = createMulter(configStorage(pathTemp));
                upload = upload.single(fieldUpload);
                return upload;
            }
            //?if user normal
            else if (!storeInfo) {
                // if user already login and this person is user account
                // ************ start normal user *****************
                // create multer storage for this user
                let upload = createMulter(configStorage(IMAGE_PATH));
                upload = upload.single(fieldUpload);
                return upload;
                // ************ End normal user *****************
            } else if (storeInfo) {
                // *********** start store manger ******************
                //? store manger

                let myPath = configFolder('mangers', req.user.id);
                if (myPath.err) throw Error(myPath.err.message);

                if (fieldUpload === 'story_store') {
                    //set the image in temp and after that move to right folder
                    let upload = createMulter(
                        configStorage(path.join(__dirname, `../upload/temp`))
                    );
                    upload = upload.single('story_store');
                    return upload;
                } else if (fieldUpload === 'avatar_store') {
                    let upload = createMulter(configStorage(myPath));
                    upload = upload.single('avatar_store');
                    return upload;
                } else if (fieldUpload === 'avatar_offers') {
                    let upload = createMulter(configStorage(myPath));
                    //if we want more then 4 , just set number here
                    upload = upload.array('avatar_offers', 4);
                    return upload;
                } else if (fieldUpload === 'avatar') {
                    let upload = createMulter(configStorage(myPath));
                    upload = upload.single('avatar');
                    return upload;
                } else if (fieldUpload == 'update_story_store') {
                    let upload = createMulter(configStorage(myPath));
                    upload = upload.single('update_story_store');
                    return upload;
                }
                // ************* end store manger ******************
            }
        } else {
            //? manger now sign up
            let pathTemp = path.join(__dirname, TEMP_PATH);
            let upload = createMulter(configStorage(pathTemp));
            upload = upload.array('avatars');

            return upload;
        }
    } catch (error) {
        return { error };
    }
};


*/
