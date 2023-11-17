select top 1 * from novapark.ticket
select top 1 * from novapark.visitor;

--use this to rename column names
EXEC sp_rename 'novapark.ticket.t_no', 'ticket_no', 'COLUMN';

select top 2 * from novapark.[user];

alter table novapark.[user] alter column privilege_type TINYINT

--gets visitor info that will be rendered in the profile page
--replace below id with user input
SELECT v.first_name, v.last_name, v.ticket_no, t.t_type
FROM novapark.visitor v
INNER JOIN novapark.ticket t ON v.ticket_no = t.ticket_no
WHERE v.ticket_no = "1162521";

--randomly set values in column `stay_in_hours` from (4,8,12,24)
--good template for random data generation and modification
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

