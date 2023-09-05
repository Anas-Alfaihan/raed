import { sequelize } from "./connect.js";
import { block, category, packs as pack, role, user } from "../models/index.js";
import { enumGender } from "./enums.js";

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
export default async () => {
    let allCategory = [
        { name: "الأحذية", emoji: "rt2r12", checkWithImageOrNot: true },
        { name: "مسبح", emoji: "12r2t2r12", checkWithImageOrNot: true },
        { name: "صيدلية", emoji: "31rt23r12", checkWithImageOrNot: true },
        { name: "بقالية", emoji: "223rtr12", checkWithImageOrNot: true },
        { name: "ملعب", emoji: "132rtr12", checkWithImageOrNot: true },
    ];
    let allRoles = [
        {
            name: "مدير",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
        {
            name: "مستخدم",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
        {
            name: "مدير محل جديد",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
        {
            name: "مدير محل مقبول",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
        {
            name: "مدير_منطقة",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
        {
            name: "موظف عادي",
            data: '{"show":["nav","settings","footer"],"action":["account.delete","account.update","store.uploadImage"]}',
        },
    ];

    // //! create default pack free
    await pack.create({
        name: "مجانية",
        duration: 40,
        price: 0,
    });

    //! create all roles default
    await role.bulkCreate(allRoles);

    //!create all category default
    await category.bulkCreate(allCategory);

    // //! create admin account
    await user.create({
        name: "admin",
        gender: enumGender.MALE,
        email: "ra2ed.alma2sre@gmail.com",
        phoneNumber: "0988720553",
        username: "admin",
        password: "qwe123QWE!@#",
        roleId: 1,
        additionalInformation: JSON.stringify({
            settings: {},
            accountCash: {},
            verify: {
                email: false,
                phone: false,
            },
        }),
    });

    await block.create({
        reason: "تجاوز عدد الابلاغات 15 الابلاغ , قد تم حجب ظهور المحل الخاص بك من الظهور ضمن الركوت الموجودة",
        restrictions: JSON.stringify({
            show: ["store"],
            action: ["store.create"],
        }),
        duration: 15,
    });
    //! #create  function for calc nearest store
    await sequelize.query(
        ` 
    CREATE FUNCTION IF NOT EXISTS calculate_nearest_store_distance(user_lat FLOAT, user_lon FLOAT, categoryID INTEGER)
    
    RETURNS INTEGER READS SQL DATA
    BEGIN
    #create  function for calc nearest store 
     DECLARE min_distance INT;
     DECLARE store_id INT;
     DECLARE store_lat FLOAT;
     DECLARE store_lon FLOAT;	
         DECLARE result INT;
     DECLARE done INT DEFAULT FALSE;  
     DECLARE cur CURSOR FOR SELECT id, latitude,longitude FROM store where categoryId=categoryID;  
     DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE; 
   
     #create temp table 
     CREATE TEMPORARY TABLE IF NOT EXISTS temp_distance (
         id INT,
         distance FLOAT
     );
 
     OPEN cur;
     read_loop: LOOP
         FETCH cur INTO store_id, store_lat, store_lon;
         IF done THEN
             LEAVE read_loop;
         END IF;
       SELECT calculate_distance(user_lat, user_lon, store_lat, store_lon)   INTO min_distance;

       INSERT INTO temp_distance (id, distance) VALUES (store_id, min_distance);
     END LOOP;
 
     CLOSE cur;
 
     SELECT store.id 
     FROM store
     INNER JOIN temp_distance ON store.id = temp_distance.id
     ORDER BY temp_distance.distance ASC limit 1 
     INTO result;
 
    DROP TEMPORARY TABLE IF EXISTS temp_distance;
     RETURN result;
 END;
    `,
        {
            type: sequelize.QueryTypes.RAW,
            raw: true,
        }
    );

    //! #create  function for calc calculate distance
    await sequelize.query(
        ` 
    CREATE FUNCTION  IF NOT EXISTS calculate_distance(lat1 FLOAT,  lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
    RETURNS INT READS SQL DATA
    BEGIN
    #create  function for calc calculate distance
    DECLARE result FLOAT;
         SELECT round(ST_DISTANCE_SPHERE(point(lon1, lat1), point(lon2, lat2))) INTO result;
          RETURN result;
  END ;`,
        {
            type: sequelize.QueryTypes.RAW,
            raw: true,
        }
    );
};

/*
  sequelize
    .query(`select @distance`, {
      type: sequelize.QueryTypes.RAW,
      raw: true,
    })
    .then((result) => {
      // console.log(result/);
      console.log(result[0][0]["@distance"]);
    })
    .catch((err) => {
      console.log(err);
    }); 

*/
