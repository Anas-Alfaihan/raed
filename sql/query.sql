    -- create schema cheaper database  
    create schema IF NOT EXISTS cheaper 

    use cheaper



    -- FUNCTION  --
    --  create calculate_distance FUNCTION
    DELIMITER //
     CREATE FUNCTION  IF NOT EXISTS calculate_distance(lat1 FLOAT,  lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
    RETURNS INT READS SQL DATA
    BEGIN
    #create  function for calc calculate distance
    DECLARE result FLOAT;
         SELECT round(ST_DISTANCE_SPHERE(point(lon1, lat1), point(lon2, lat2))) INTO result;
          RETURN result;
     END //
    DELIMITER ;

    
    --  create sort_stores FUNCTION
    DELIMITER //
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
    END//
    DELIMITER ;
    -- end FUNCTION  --