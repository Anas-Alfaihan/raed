const Stores = require("../models/store.model");
const Category = require("../models/category.model");
const Packs = require("../models/packs.model");
const packsStore = require("../models/packsStore.model");
const StoreStory = require("../models/StoreStory.model");
require("../models/relations");
const { Op } = require("sequelize");
let path = require("path");
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
let {
  removeFolder,
  sortAvatars,
  removePic,
  moveFile,
} = require("../utils/helper");
const User = require("../models/user.model");
const stores = require("../models/store.model");
const pack = require("../models/packs.model");
//helper function
let validateManger = async (req, res) => {
  try {
    //? check name store
    let store = await Stores.findOne({
      where: {
        nameStore: req.body.nameStore.trim(),
      },
      paranoid: false,
    });
    if (store)
      throw Error(`اسم المحل \'${req.body.nameStore.trim()}\' موجود بلفعل `);

    //? check category name
    let category = await Category.findOne({
      where: { name: req.body.category.trim() },
      raw: true,
    });
    if (!category) throw Error("صنف المتجر غير صحيح ");

    //!/info manger

    let constraint = ["حميدة 231"];
    //? check SSN
    let info = await InfoManger.findByPk(req.body.ssn);
    if (info) throw Error("الرقم الوطني موجود سابقا ");
    //? check country
    let country = await Country.findOne({
      where: { name: req.body.country.trim() },
    });
    if (!country)
      throw Error(
        "اسم المدينة غير صحيح الرجاء القيام بادخال اسم المدينة بلشكل الصحيح "
      );
    //? check constraint
    if (!constraint.includes(req.body.constraint.trim()))
      throw Error("قيمة لقيد غير صحيحة");

    // console.log({ countryId: country.id, categoryId: category.id });
    return { countryId: country.id, categoryId: category.id };
  } catch (err) {
    return { error: err.message };
  }
};
//this for create avatars store
let createStoreStory = async (req, store) => {
  //! should upload every image "StoreStory"
  try {
    let storeStory = [];
    for (let i = 0; i < req.files.StoreStory.length; i++)
      storeStory.push({
        storeId: store.id,
        avatar: req.files.StoreStory[i].path,
      });
    // console.log(storeStory);
    //create all avatar store
    await StoreStory.bulkCreate([...storeStory]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

//controllers
//share with other file in project
module.exports.createStoreStory = createStoreStory;
//create Store
module.exports.createStore = async (req, manger) => {
  let infoManger = null;
  try {
    //validate the manger
    let result = await validateManger(req);
    if (result.error) {
      throw Error(result.error);
    }
    // console.log(manger.id);
    //should re store the image at the right path
    let resultSort = sortAvatars(req, "signup", manger.id);
    if (resultSort.error) throw Error(resultSort.error);

    //?create information manger
    //should upload the image and get the link
    infoManger = await InfoManger.create({
      ...req.body,
      userId: manger.id,
      countryId: result.countryId,
      avatar1: req.files.avatar1[0].path,
      avatar2: req.files.avatar2[0].path,
    });

    //?create new store
    let store = await Stores.create({
      ...req.body,
      avatar: req.files.avatar[0].path,
      categoryId: result.categoryId,
      userId: manger.id,
    });
    //?create avatar store
    let allAvatar = await createStoreStory(req, store);
    if (allAvatar.error) {
      // console.log(allAvatar);
      // removeFolder(req);
      await infoManger.destroy({ force: true });
      await store.destroy({ force: true });
      throw Error(allAvatar.error);
    }
    return { success: true };
  } catch (err) {
    // await infoManger.destroy({ force: true });

    removeFolder("mangers", manger.id);
    return { success: false, error: err.message };
  }
};
//update store
module.exports.update = async (req, res) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");

    //validate name
    let store = await Stores.findOne({
      where: {
        nameStore: req.body.nameStore.trim(),
        userId: { [Op.ne]: req.user.id },
      },
      paranoid: false,
    });
    if (store)
      throw Error(`اسم المتجر \'${req.body.nameStore.trim()}\' موجود بلفعل `);

    //?check category id
    let category = await Category.findOne({
      where: { name: req.body.category.trim() },
    });
    if (!category) throw Error("اسم الصنف  غير صحيح");
    store = req.user.toJSON().stores[0];
    //path in temp
    let pathBefore = store.avatar;
    // console.log(pathBefore, "before");
    //remove the avatar from the temp folder
    let eer = removePic(pathBefore);
    if (eer) throw Error(eer);
    // console.log(req.file.path, "now");
    //update stores in db
    await Stores.update(
      {
        ...req.body,
        avatar: req.file.path,
        categoryId: category.id,
        userId: req.user.id,
      },
      { where: { userId: req.user.id } }
    );
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تم التحديث بنجاح ` });
  } catch (err) {
    if (req.file) removePic(req.file.path);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//! packs

module.exports.disablePack = async (req, res) => {
  try {
    let store = await req.user.getStores({ raw: true, attributes: ["id"] });
    if (store.toString() == []) throw Error("يجب ان تمتلك متجر اولا ");

    const pack = await Packs.findByPk(req.params.id);
    if (!pack) throw Error("رقم الباقة غير صحيح ");

    let packDel = await packsStore.findOne({
      where: { packId: req.params.id },
      attributes: ["id"],
    });
    if (!packDel)
      throw Error("الباقة المطلوبة محذوفة مسبقا او انك لم تشترك فيها ");

    await packDel.destroy();
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all packs of this store and other store with have this user
module.exports.getPacks = async (req, res) => {
  try {
    let result = { active: {}, ended: [] };
    let all = await packsStore.findAll({
      attributes: { exclude: ["packId"] },
      paranoid: true,
      where: { userId: req.user.id },
      include: { model: pack, attributes: ["name", "duration", "price"] },
    });

    all.forEach((record) => {
      if (record.disableAt) result.ended.push(record);
      result.active.push(record);
    });
    return res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//choose one of the pack for store
module.exports.choosePack = async (req, res) => {
  try {
    let store = await stores.findOne({
      attributes: ["id", "unavailableAt"],
      where: { userId: req.user.id },
    });
    if (!store) throw Error("لا يمكنك عرض الباقات دون ان تكون تمتلك متجر ");

    if (store.unavailableAt)
      throw Error("المحل غير مفعل الرجاء القيام بعملية التفعيل اولا");

    let myPack = await pack.findByPk(req.params.id);
    if (!myPack) throw Error("رقم الباقة المدخل غير صحيح ");

    if (
      await packsStore.findOne({
        attributes: ["id"],
        where: { storeId: store.id, packId: req.params.id },
      })
    )
      throw Error(
        "انت مشترك في باقة من قبل لايمكنك ان تشترك في اكثررمن باقة في نفس الوقت الرجاء الانتظار ل انتهار مدة الباقة او الغائها ثم قم  ب اعادة الاشتراك في باقة جديدة "
      );
    await packsStore.create({
      storeId: store.id,
      packId: req.params.id,
    });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم الاشتراك في الباقة بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: err.message });
  }
};
module.exports.getAllInfo = async (req, res) => {
  try {
    let store = await Stores.findOne({
      where: { userId: req.user.id },
      attributes: [
        "id",
        "nameStore",
        ["avatar", "picture"],
        "fromHour",
        "toHour",
        "longitude",
        "latitude",
      ],
      include: [
        {
          model: Category,
          attributes: [["name", "nameCategory"]],
        },
        {
          model: User,
          attributes: ["email", "phoneNumber1", "phoneNumber2"],
        },
      ],
    });
    let AllStory = await StoreStory.findAll({
      where: { storeId: store.id },
      attributes: [["avatar", "picture"]],
    });

    //here should ask front end if need to show this pack or not
    //packs
    let packs = await store.getPacks({
      raw: true,
      attributes: ["name", "duration", "price", "createdAt"],
    });

    packs = _.pick(packs[0], ["name", "duration", "price", "createdAt"]);
    let resultStore = _.omit(store.toJSON(), ["id"]);
    resultStore.packs = packs;
    resultStore.storyStore = AllStory;

    res.status(StatusCodes.OK).send({ success: true, data: resultStore });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//! image avatar store
//upload image
module.exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");
    let store = req.user.toJSON().stores[0];
    await Stores.update({ avatar: req.file.path }, { where: { id: store.id } });
    let err = removePic(store.avatar);
    if (err) throw Error(err.message);

    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get image
module.exports.getImage = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];

    if (!store.avatar) throw Error("لا يوجد صورة ");
    return res
      .status(StatusCodes.OK)
      .send({ success: true, data: store.avatar });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteImage = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];
    // console.log(store);
    if (!store.avatar) throw Error("لا يوجد صورة ");
    await Stores.update({ avatar: null }, { where: { id: store.id } });
    let err = removePic(store.avatar);
    if (err) throw Error(err.message);
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//! story store
//upload story mean add new story
module.exports.uploadStory = async (req, res, next) => {
  try {
    // console.log(1);
    if (!req.file) throw Error("لا يوجد صورة ");
    let store = req.user.toJSON().stores[0];
    let allStory = await StoreStory.findAll({
      where: { storeId: store.id },
      raw: true,
    });
    if (allStory.length == 4)
      throw Error("لا يمكن ان يكون لديك اكثر من 4 صور ");
    else if (allStory.length < 4) {
      // console.log(1);
      let store = req.user.toJSON().stores[0];
      let myPath = moveFile(
        req.file.path,
        path.join(__dirname, `../upload/images/mangers/${store.userId}`)
      );
      req.file.path = myPath;
      await StoreStory.create({
        avatar: req.file.path,
        storeId: store.id,
      });
      return res
        .status(StatusCodes.OK)
        .send({ success: true, msg: "تمت عملية الرفع بنجاح" });
    }
  } catch (err) {
    if (req.file) removePic(req.file.path);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get All image
module.exports.getAllStory = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];
    let allStory = await StoreStory.findAll({ where: { storeId: store.id } });
    allStory = allStory.map((e) => _.pick(e, "avatar"));

    return res.status(StatusCodes.OK).send({ success: true, data: allStory });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteStory = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];
    let story = await StoreStory.findOne({
      raw: true,
      where: { id: req.params.id, storeId: store.id },
    });
    if (!story) throw Error("رقم الصورة المطلوب غير صححيح");
    await StoreStory.destroy({
      where: { id: req.params.id, storeId: store.id },
    });

    let err = removePic(story.avatar);
    if (err) throw Error(err.message);

    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteAllStory = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];
    let allStory = await StoreStory.findAll({ where: { storeId: store.id } });
    if (allStory.toString() == []) throw Error("لا يوجد صور لحذفها ");
    await StoreStory.destroy({
      where: { storeId: store.id },
    });
    allStory.forEach((e) => {
      let err = removePic(e.avatar);
      if (err) throw Error(err.message);
    });

    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update Image Story mean update recent story
module.exports.updateStory = async (req, res, next) => {
  try {
    // console.log(req.file);
    if (!req.file) throw Error("لا يوجد صور ");
    //get store
    let store = req.user.toJSON().stores[0];
    let image = await StoreStory.findOne({
      where: { storeId: store.id, id: req.params.id },
    });
    if (!image) throw Error("رقم الصورة المطلوب غير صحيح");
    await StoreStory.update(
      { avatar: req.file.path },
      { where: { storeId: store.id, id: req.params.id } }
    );
    let err = removePic(image.avatar);
    if (err) throw Error(err.message);
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية التحديث بنجاح" });
  } catch (err) {
    let err2 = removePic(req.file.path);
    if (err2) throw Error(err.message);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get Special Story
module.exports.getSpecialStory = async (req, res) => {
  try {
    let store = req.user.toJSON().stores[0];
    let story = await StoreStory.findOne({
      where: { storeId: store.id, id: req.params.id },
    });
    if (!story) throw Error("الصورة المطلوبة غير مودجودة");
    story = _.pick(story, "avatar");

    return res.status(StatusCodes.OK).send({ success: true, data: story });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

// more router maybe not need but i write it :
//remove store , note: if remove store then is return to
// module.exports.remove = async (req, res) => {
//   try {
//     let store = await Stores.findOne({
//       where: { userId: req.user.id },
//       paranoid: false,
//     });
//     if (!store)
//       throw Error("لا يمكن القيام بعملية الحذف دون ان يكون لديك متجر ");

//     ///should before delete store => delete user account , delete every pivot record,delete the notification of store ,

//     await Stores.destroy({ where: { userId: req.user.id }, force: true });
//     return res
//       .status(StatusCodes.OK)
//       .send({ success: true, msg: "تم الحذف بنجاح" });
//   } catch (err) {
//     res
//       .status(StatusCodes.BAD_REQUEST)
//       .send({ success: false, error: err.message });
//   }
// };
//disable
// module.exports.disable = async (req, res) => {
//   try {
//     let store = await Stores.findOne({
//       where: { userId: req.user.id },
//       paranoid: false,
//     });
//     if (store.disableAt) throw Error("المحل غير مفعل سابقا");

//     if (!store) throw Error("يجب ان يكون لديك متحر للتمكن من علملية التعطيل");

//     await store.destroy();
//     return res
//       .status(StatusCodes.OK)
//       .send({ success: true, msg: "تم الغاء تفعيل المحل بنجاح" });
//   } catch (error) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .send({ success: false, error: error.message });
//   }
// };
// // restore account
// module.exports.restore = async (req, res) => {
//   try {
//     let store = await Stores.findOne({
//       where: { userId: req.user.id },
//       paranoid: false,
//     });
//     if (!store) throw Error("لا يمكن الاستعادة دون ان يكون لديك متجر ");

//     if (!store.disableAt) throw Error("المتجر مفعل سابقا");

//     //enable the store
//     await store.restore();
//     return res
//       .status(StatusCodes.OK)
//       .send({ success: true, msg: "تم عملية التفعيل بنجاح " });
//   } catch (error) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .send({ success: false, error: error.message });
//   }
// };

// //remove
// router.delete(
//   "/delete",
//   auth
//   // access(permissions.store.delete),
//   // control.remove
// );

// // disable
// router.delete(
//   "/disable",
//   auth,
//   access(permissions.store.disable),
//   control.disable
// );

// // enable
// router.put("/enable", auth, access(permissions.store.enable), control.restore);
