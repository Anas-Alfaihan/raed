import dotenv from 'dotenv';

dotenv.config({ path: `./.env` });
import bcryptJs from 'bcryptjs';

export let bcrypt =   (password) => {
    const salt =   bcryptJs.genSaltSync(12);
    return bcryptJs.hashSync(password, salt);
};

export let compare = async (password, validPassword) =>
    await bcryptJs.compare(password, validPassword);
