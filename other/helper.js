var fs = require("fs");
const { configStorage, createMulter } = require("../config/multer");
const path = require("path");

let moveFile = (file, dir2) => {
  var f = path.basename(file);
  var dest = path.resolve(dir2, f);

  fs.rename(file, dest, (err) => {
    if (err) throw Error(err);
  });
  return dest;
};
let removeFolder = (type, id) => {
  try {
    let folder = path.join(__dirname, `../upload/images/${type}/${id}`);
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

let removePic = (myPath) => {
  if (fs.existsSync(myPath)) {
    fs.unlink(myPath, (err) => {
      // myError.error = err;
      return err;
    });
  }
};

let removeAvatars = (req) => {
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
        if (fs.existsSync(element.path)) fs.unlink(element.path, showError);
      });
  }
  if (req.file) removePic(req.file.path);
};

// how to remove folder if exists in path ?

let checkAvatars = (req) => {
  //? check images
  if (
    //if any avatar not found
    !req.files.StoreStory ||
    !req.files.avatar ||
    !req.files.avatar1 ||
    !req.files.avatar2 ||
    !req.files.StoreStory ||
    (req.files.StoreStory && req.files.StoreStory.length < 3)
  ) {
    return false;
  }
  return true;
};
let configFolder = (type, id) => {
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
let sortAvatars = (req, type, id) => {
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
      // console.log(1);
      let myPath = configFolder("mangers", id);
      if (myPath.err) throw Error(myPath.err);

      // console.log(222);
      //should remove from temp and set in the sorted folder

      //! move avatar identity
      moveFile(req.files.avatar[0].path, myPath);
      req.files.avatar[0].path = path.join(
        myPath,
        req.files.avatar[0].filename
      );

      ///! move avatar1
      moveFile(req.files.avatar1[0].path, myPath);
      req.files.avatar1[0].path = path.join(
        myPath,
        req.files.avatar1[0].filename
      );
      //! move avatar2 identity
      myPath;
      moveFile(req.files.avatar2[0].path, myPath);
      req.files.avatar2[0].path = path.join(
        myPath,
        req.files.avatar2[0].filename
      );

      //! move store story
      for (let i = 0; i < req.files.StoreStory.length; i++) {
        moveFile(req.files.StoreStory[i].path, myPath);
        req.files.StoreStory[i].path = path.join(
          myPath,
          req.files.StoreStory[i].filename
        );
      }
    }
    return true;
  } catch (error) {
    return { error };
  }
};
let configUpload = async (req, fieldUpload, type) => {
  try {
    if (req.user) {
      let storeInfo = req.user.toJSON().stores[0];
      if (type == "update account") {
        //if now update the account then set this pic in the temp folder
        let pathTemp = path.join(__dirname, `../upload/temp`);
        let upload = createMulter(configStorage(pathTemp));
        upload = upload.single(fieldUpload);
        return upload;
      }
      //?if user normal
      else if (!storeInfo) {
        // if user already login and this person is user account
        // ************ start normal user *****************
        let myPath = configFolder("users", req.user.id);
        if (myPath.err) throw Error(myPath.err.message);
        // create multer storage for this user
        let upload = createMulter(configStorage(myPath));
        upload = upload.single(fieldUpload);
        return upload;
        // ************ End normal user *****************
      } else if (storeInfo) {
        // *********** start store manger ******************
        //? store manger

        let myPath = configFolder("mangers", req.user.id);
        if (myPath.err) throw Error(myPath.err.message);
        if (fieldUpload === "story_store") {
          //set the image in temp and after that move to right folder
          let upload = createMulter(
            configStorage(path.join(__dirname, `../upload/temp`))
          );
          upload = upload.single("story_store");
          return upload;
        } else if (fieldUpload === "avatar_store") {
          let upload = createMulter(configStorage(myPath));
          upload = upload.single("avatar_store");
          return upload;
        } else if (fieldUpload === "avatar_offers") {
          let upload = createMulter(configStorage(myPath));
          //if we want more then 4 , just set number here
          upload = upload.array("avatar_offers", 4);
          return upload;
        } else if (fieldUpload === "avatar") {
          let upload = createMulter(configStorage(myPath));
          upload = upload.single("avatar");
          return upload;
        } else if (fieldUpload == "update_story_store") {
          let upload = createMulter(configStorage(myPath));
          upload = upload.single("update_story_store");
          return upload;
        }
        // ************* end store manger ******************
      }
    } else {
      //? manger now sign up
      let pathTemp = path.join(__dirname, `../upload/temp`);
      let upload = createMulter(configStorage(pathTemp));
      upload = upload.fields([
        { name: "StoreStory", maxCount: 4 },
        { name: "avatar1", maxCount: 1 },
        { name: "avatar2", maxCount: 1 },
        { name: "avatar", maxCount: 1 },
      ]);
      return upload;
    }
  } catch (error) {
    return { error };
  }
};

module.exports.configUpload = configUpload;
module.exports.moveFile = moveFile;
module.exports.removeAvatars = removeAvatars;
module.exports.checkAvatars = checkAvatars;
module.exports.sortAvatars = sortAvatars;
module.exports.configFolder = configFolder;
module.exports.removeFolder = removeFolder;
module.exports.removePic = removePic;
