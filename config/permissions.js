export let permissions = {
    //User
    user: {
        all: 'user.all',
        getUserInterests: 'user.interests',
    },
    //Account
    account: {
        update: 'account.update',
        delete: 'account.delete',
        disable: 'account.disable',
        changePassword: 'account.changePassword',
        changePhone: 'account.changePhone',
        changeEmail: 'account.changeEmail',
        //image account
        uploadImage: 'account.uploadImage',
        deleteImage: 'account.deleteImage',
        getImage: 'account.getImage',
    },
    //Category
    category: {
        create: 'category.create',
        update: 'category.create',
        delete: 'category.create',
    },
    //Role
    role: {
        create: 'role.create',
        update: 'role.update',
        delete: 'role.delete',
        all: 'role.all',
    },
    //Store
    store: {
        create: 'store.create',
        update: 'store.update',
        disable: 'store.disable',
        enable: 'store.enable',
        delete: 'store.delete',
        all: 'store.all',
        ///pack store
        choosePackStore: 'store.choosePackStore',
        getPacksStore: 'store.getPacksStore',
        deletePackStore: 'store.deletePackStore',
        deletePacksEnded: 'store.deletePacksEnded',
        //avatar store
        uploadImage: 'store.uploadImage',
        deleteImage: 'store.deleteImage',
        getImage: 'store.getImage',
        //story store
        uploadStory: 'store.uploadImagesStory',
        deleteStory: 'store.deleteImagesStory',
        getAllStory: 'store.getImagesStory',
        updateStory: 'store.updateStory',
        getSpecialStory: 'store.getSpecialStory',
        deleteAllStory: 'store.deleteAllStory',
    },
    //Packs
    packs: {
        create: 'packs.create',
        update: 'packs.update',
        delete: 'packs.delete',
        all: 'packs.all',
    },
    //Country
    country: {
        create: 'country.create',
        update: 'country.update',
        all: 'country.all',
    },
    //ban list
    ban_list: {
        create: 'ban_list.create',
        update: 'ban_list.update',
        delete: 'ban_list.delete',
        all: 'ban_list.all',
        blockManger: 'ban_list.blockManger',
    },
}
