select top 1 * from novapark.ticket
select top 1 * from novapark.visitor;

--use this to rename column names
EXEC sp_rename 'novapark.ticket.t_no', 'ticket_no', 'COLUMN';


select * from novapark.[user];

insert into novapark.[user] (
    first_name,
    last_name,
    privilege_type,
    email,
    passkey
) values (
    'ikenna',
    'ezeaju',
    11,
    'iezeaju@novapark.com',
    'staaglands!'
)
select top 1 * from novapark.[user]

delete from novapark.[user]

alter table novapark.[user]
add first_name varchar(15) not null;
alter table novapark.[user]
add last_name varchar(15) not null;

alter table novapark.[user]
alter column email varchar(50) not NULL

create table novapark.[user] (
    user_no INT IDENTITY(1,1) PRIMARY KEY,
    privilege_type tinyint not null default 0,
    email varchar(25) not null,
    passkey varchar(50) not null,
    ticket_no NCHAR(7),
    foreign key (ticket_no) REFERENCES novapark.ticket(ticket_no)
)

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

