const Users = require("../models/user.model");
//utils folder
const { createToken } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const { compare } = require("../utils/bcrypt");
const { createStore } = require("./stores.controllers");
const { updateInterests } = require("./users.controllers");
const { Op } = require("sequelize");
require("../models/relations");
let { checkAvatars, removeAvatars } = require("../utils/helper");
const tokenTable = require("../models/tokenTable.model");
const users = require("../models/user.model");
const role = require("../models/role.model");
const useragent = require("useragent");

const moment = require("moment");
/*
///basic roles in system :
  1 Admin 
  2 User
  3 Manger new 
  4 Manger saved
  5 manger country 
#this roles can't any one edit or delete them 
#but other role can edit on it 
*/

let setToken = async (req, res, id) => {
  let agent = useragent.parse(req.headers["user-agent"]);
  const token = createToken(req, {
    username: req.body.username.trim(),
  });
  // console.log(1);
  await tokenTable.create({
    token,
    browser: agent.family,
    system: agent.os.toString(),
    device: agent.device.toString(),
    userId: id,
    expiresAt: moment().add(90, "days").format("YYYY-MM-DD h:mm:ss"),
  });

  res.cookie("cheaper-token", token, {
    //90 day
    //day * hour * minute * second * mile second
    maxAge: 90 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.cookie("cheaper-checkToken", true, {
    //day * hour * minute * second * mile second
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
};

//* Sign Up for user
module.exports.signUpUser = async (req, res) => {
  try {
    if (req.body.phoneNumber1.trim() == req.body.phoneNumber2.trim())
      throw Error("لا يمكن ان يكون نفس الارقام الهاتف");

    let user = await Users.findOne({
      attributes: ["id"],
      where: { username: req.body.username.trim() },
    });
    if (user) throw Error("اسم المستخدم موجود لحساب اخر ");

    user = await Users.findOne({
      attributes: ["id"],
      where: {
        [Op.or]: [
          { phoneNumber1: req.body.phoneNumber1.trim() },
          { phoneNumber2: req.body.phoneNumber1.trim() },
          { phoneNumber1: req.body.phoneNumber2.trim() },
          { phoneNumber2: req.body.phoneNumber2.trim() },
        ],
      },
    });
    if (user) throw Error("احدى ارقام الهاتف موجودة لحساب اخر");

    //create user
    var newUser = await Users.create({
      //because role id for user is 2
      roleId: 2,
      ...req.body,
      user_settings: process.env.USER_SETTINGS,
    });

    ///create interests
    let { error } = await updateInterests(req, newUser);
    if (error) {
      //delete this user from database
      await newUser.destroy({ force: true });
      throw Error(error);
    }
    await setToken(req, res, newUser.id);

    let myRole = await role.findByPk(2);
    //done created
    return res.status(StatusCodes.CREATED).send({
      success: true,
      data: {
        name: myRole.name,
        permission: JSON.parse(myRole.data),
      },
    });
  } catch (error) {
    //return error to user
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* Sign Up for Manger Store
module.exports.signUpManger = async (req, res) => {
  try {
    if (!checkAvatars(req)) throw Error("بعض حقول الصور غير صحيحة ");

    //? check phone Number
    if (req.body.phoneNumber1.trim() == req.body.phoneNumber2.trim()) {
      throw Error("لا يمكن ان يكون نفس الارقام الهاتف");
    }
    let user = await Users.findOne({
      where: {
        [Op.or]: [
          { username: req.body.username.trim() },
          { phoneNumber1: req.body.phoneNumber1.trim() },
          { phoneNumber2: req.body.phoneNumber1.trim() },
          { phoneNumber1: req.body.phoneNumber2.trim() },
          { phoneNumber2: req.body.phoneNumber2.trim() },
        ],
      },
    });
    // console.log(user);
    if (user) {
      throw Error("اسم المستخدم او  ارقام الهاتف موجودة لحساب اخر ");
    }
    //?create manger (User) account
    var manger = await Users.create({
      //because role id for new manger is 3 ,after accepted from the admin  then change role (for allow to manger to modify offer )
      roleId: 3,
      ...req.body,
      user_settings: process.env.USER_SETTINGS,
    });

    //create new token
    const access_token = createToken({ id: manger.id });
    await Users.update({ access_token }, { where: { id: manger.id } });
    //? create store
    let { error } = await createStore(req, manger);
    if (error) {
      //for remove every avatars uploaded because error happen
      // rem/oveFolder(req);
      //delete this user from database
      await manger.destroy({ force: true });
      throw Error(error);
    }
    return res
      .status(StatusCodes.CREATED)
      .send({ success: true, access_token });
  } catch (error) {
    removeAvatars(req);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* login
module.exports.login = async (req, res) => {
  try {
    const myInfo = await users.findOne({
      where: { username: req.body.username.trim() },
      paranoid: false,
      include: { model: role, attributes: ["name", "data"] },
    });

    //if not found user like this username
    if (!myInfo) throw Error("اسم المستخدم غير صحيح");

    //compare password
    const validPassword = await compare(req.body.password, myInfo.password);
    if (!validPassword) throw Error("كلمة المرور غير صحيحة ");

    //if user account is disable before then reactive this account
    if (myInfo.disableAt) await myInfo.restore();

    await setToken(req, res, myInfo.id);

    res.status(StatusCodes.OK).send({
      success: true,
      data: {
        name: myInfo.role.name,
        permission: JSON.parse(myInfo.role.data),
      },
    });
  } catch (error) {
    //throw error to user
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* logout
module.exports.logout = async (req, res) => {
  try {
    // console.log(req.headers);
    //delete token access
    let agent = useragent.parse(req.headers["user-agent"]);

    let token = await tokenTable.findOne({
      where: {
        token: req.cookies["cheaper-token"],
        browser: agent.family,
        device: agent.device.toString(),
        userId: req.user.id,
      },
    });

    if (!token) throw Error("هذا الحساب مسجل خروج من هذا المتصفح ");

    token.destroy({ force: true });

    res.clearCookie("cheaper-token");
    res.cookie("cheaper-checkToken", false, {});
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم تسجيل الخروج بنجاح " });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};
