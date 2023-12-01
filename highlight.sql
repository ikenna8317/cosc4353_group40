--add random
UPDATE novapark.resort_reservation
SET stay_in_hours = 
    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 'silver'
        WHEN 1 THEN 'gold'
        WHEN 2 THEN 'platinum'
        WHEN 3 THEN 'silver'
    END;

--resort reservation date constraint: make sure reserved date is atleast 24 hours ahead of current date
alter table novapark.resort_reservation
add CONSTRAINT chk_date CHECK (_date >= DATEADD(HOUR, 24, GETDATE()))


--easily update dates of all entries in table with something this
UPDATE novapark.resort_reservation
SET _date = DATEADD(HOUR, 248 + stay_in_hours, GETDATE());


--check constraint to make sure that the reserved date is not in the past
alter table novapark.resort_reservation
add constraint chk_resort_date
check (_date >= GETDATE())

alter table novapark.restaurant_reservation
add constraint chk_restaurant_date
check (_date >= GETDATE())

--possible trigger
--DATEDIFF(HOUR, i._date, rr._date) <= 24
CREATE TRIGGER CheckRestaurantReservationWithin24Hrs
ON novapark.restaurant_reservation
AFTER INSERT, UPDATE
AS
 BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        INNER JOIN novapark.resort_reservation AS r ON DATEDIFF(HOUR, r._date, i._date) > 24
    )
    BEGIN
        RAISERROR ('You put in a date that is more than 24 hours ahead of another reservation', 16, 1);
        ROLLBACK transaction;
    END
 END;

--we also added this
CREATE TRIGGER CheckResortReservationWithin24Hrs
ON novapark.resort_reservation
AFTER INSERT, UPDATE
AS
 BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        INNER JOIN novapark.restaurant_reservation AS rr ON DATEDIFF(HOUR, rr._date, i._date) > 24 and rr.ticket_no = i.ticket_no
    )
    BEGIN
        RAISERROR ('You put in a date that is more than 24 hours ahead of another reservation', 16, 1);
        ROLLBACK transaction;
    END
 END;


drop trigger if exists novapark.CheckResortReservationWithin24Hrs

--trigger to check that reservation date is between selected restaurant operating hours
CREATE TRIGGER CheckReservationDateValid
ON novapark.restaurant_reservation
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @RestaurantNo SMALLINT, @ReservationDate DATETIME, @OpenTime TIME, @CloseTime TIME;
    
    SELECT @RestaurantNo = r._no, @ReservationDate = i._date
    FROM inserted i
    JOIN novapark.restaurant r ON i._no = r._no;

    SELECT @OpenTime = open_time, @CloseTime = close_time
    FROM novapark.restaurant
    WHERE _no = @RestaurantNo;

    DECLARE @ReservationTime TIME;
    SET @ReservationTime = CONVERT(TIME, @ReservationDate);

    IF @ReservationTime NOT BETWEEN @OpenTime AND @CloseTime
    BEGIN
        RAISERROR ('Reservation date is not within restaurant open hours', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;



--daily attendance report
select convert(DATE, _date) as converted_date, count(distinct visitor_no) as visitors
from novapark.purchase
group by convert(DATE, _date)
order by converted_date;

-- SELECT a.name AS attraction_name,
--        COUNT(t.visitor_id) AS visitor_count
-- FROM attractions a
-- JOIN tickets t ON a.attraction_id = t.attraction_id
-- GROUP BY a.name
-- ORDER BY visitor_count DESC;


--Top Attractions by Visitor Count:
SELECT a.ride_name AS ride_name,
       COUNT(novapark.ride_entry.ticket_no) AS visitor_count
FROM novapark.amusement_ride as a
JOIN novapark.ride_entry as t ON a.ride_no = t.ride_no
GROUP BY a.ride_name
ORDER BY visitor_count DESC;

--Age distribution of visitors
SELECT age,
       COUNT(visitor_no) AS visitor_count
FROM novapark.visitor
GROUP BY age;


--ride popularity report
SELECT a.ride_name,
       COUNT(DISTINCT re.visitor_no) AS total_visitors
FROM novapark.ride_entry as re
JOIN novapark.amusement_ride as a ON re.ride_no = a.ride_no
JOIN novapark.visitor as v ON re.visitor_no = v.visitor_no
WHERE a.ride_name = @ride_name
  AND re._date BETWEEN @start_date AND @end_date
GROUP BY a.ride_name;


--technician workload report
SELECT T.staff_no, T._name, COUNT(ML._no) AS Tasks_Count
FROM novapark.technician T
LEFT JOIN maintain_log ML ON T.staff_no = ML.technician_no
WHERE T._name = @name AND convert(date, ML._date) BETWEEN convert(date, @startDate) AND convert(date, @endDate)
GROUP BY T.staff_no, T._name;
--example
SELECT T.staff_no, T._name, COUNT(ML._no) AS Tasks_Count
FROM novapark.technician T
LEFT JOIN novapark.maintain_log ML ON T.staff_no = ML.technician_no
WHERE T._name = 'Martin' AND convert(date, ML._date) BETWEEN convert(date, '2022-07-09') AND convert(date, '2023-10-10')
GROUP BY T.staff_no, T._name;