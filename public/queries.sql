--suite type

UPDATE novapark.resort_reservation
SET stay_in_hours = 
    CASE ABS(CHECKSUM(NEWID())) % 4
        WHEN 0 THEN 4
        WHEN 1 THEN 8
        WHEN 2 THEN 12
        WHEN 3 THEN 24
    END;

select * from novapark.suite_and_prices;


select top 3 * from novapark.resort_reservation;

select top 3 * from novapark.ticket;

select top 5 ticket_no, stay_in_hours, suite_type from novapark.resort_reservation;

