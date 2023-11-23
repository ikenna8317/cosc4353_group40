--add random
UPDATE novapark.resort_reservation
SET stay_in_hours = 
    CASE ABS(CHECKSUM(NEWID())) % 4
        WHEN 0 THEN 4
        WHEN 1 THEN 8
        WHEN 2 THEN 12
        WHEN 3 THEN 24
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
CREATE TRIGGER CheckResortReservationWithin24Hrs
ON novapark.resort_reservation
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        INNER JOIN novapark.restaurant_reservation AS rr ON DATEDIFF(HOUR, rr._date, i._date) > 24
    )
    BEGIN
        RAISEERROR ('You must not put in a date that is more than 24 hours ahead of the restaurant reservation', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
