import packs from "./packs.model.js";
import token from "./tokenTable.model.js";
import offersUser from "./offersUser.model.js";
import block from "./block.model.js";
import blockUser from "./blockUser.model.js";
import usersCategory from "./usersCategory.js";
import packsStore from "./packsStore.model.js";
import store from "./store.model.js";
import user from "./user.model.js";
import category from "./category.model.js";
import role from "./role.model.js";
import notification from "./notification.model.js";
import storeStory from "./storeStory.model.js";
import giftedOffers from "./giftedOffers.model.js";

// //! User has many-to-many pack
store.hasMany(packsStore, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
packsStore.belongsTo(store);

packs.hasMany(packsStore, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
packsStore.belongsTo(packs);

//! user has many offer gifted as send gift id

user.hasMany(giftedOffers, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    foreignKey: "senderId",
    hooks: true,
});
giftedOffers.belongsTo(user, { foreignKey: "senderId", as: "sender" });

//! user has many offer gifted as recipient gift id
user.hasMany(giftedOffers, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    foreignKey: "receiverId",
    hooks: true,
});
giftedOffers.belongsTo(user, { foreignKey: "receiverId", as: "receiver" });

//! offerPack has one-to-many offer gifted
offersUser.hasMany(giftedOffers, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
giftedOffers.belongsTo(offersUser);

//! User has many-to-many category
user.belongsToMany(category, {
    // belongsToMany with sequelize example with option ?
    through: usersCategory,
    hooks: true,
});
category.belongsToMany(user, {
    through: usersCategory,
    hooks: true,
});

// //! User has many-to-many packsStore (offer card )
user.hasMany(offersUser, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
offersUser.belongsTo(user);

packsStore.hasMany(offersUser, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
offersUser.belongsTo(packsStore);

// //! category has one-to-many stores
//if delete the category then will delete the all store
category.hasMany(store, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
store.belongsTo(category);

//! roles has one-to-many users
//if delete the role then will delete the all user have like this role
role.hasMany(user, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
user.belongsTo(role);

//! users has one-to-many notifications
user.hasMany(notification, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
notification.belongsTo(user);

// //! User and ban_list
user.hasMany(blockUser, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
blockUser.belongsTo(user);

block.hasMany(blockUser, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
blockUser.belongsTo(block);

//if delete the user account then will delete the store
user.hasMany(store, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
store.belongsTo(user);

user.hasMany(token, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
token.belongsTo(user);

store.hasMany(storeStory, {
    constraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    hooks: true,
});
storeStory.belongsTo(store);

export {
    packs,
    token,
    offersUser,
    store,
    block,
    blockUser,
    usersCategory,
    packsStore,
    user,
    category,
    giftedOffers,
    role,
    notification,
    storeStory,
};
