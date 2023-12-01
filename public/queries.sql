select top 1 * from novapark.ticket
select top 3 t_type from novapark.ticket;

alter table novapark.staff
drop constraint DF__staff__ssn__25518C17



update novapark.staff
set phone_no = @phone_no, address = @address,
week_wage = @week_wage, dept_no = @dept_no where staff_no = @staff_no

-- INSERT INTO destination_table (column1, column2, column3)
-- SELECT column1, column2, column3
-- FROM source_table;

insert into novapark.staff (@fname, @lname, @phone_no, @address, @week_wage, d.d_name)
select d.d_name
from novapark.staff as s inner join novapark.department as d on s.dept_no = d.d_no where s.dept_no = @dept_no

--sales is 5
select top 1 * from novapark.staff order by staff_no desc

alter table novapark.theme_event
drop column event_no

alter table novapark.theme_event
drop 

insert into novapark.theme_event (_name, img_path, event_desc, event_date)
values ('Charity hunt', 'path-to-image8', 'find and hunt for charities', '2023-12-04 13:09')

insert into novapark.staff (fname, lname, phone_no, address, week_wage, dept_no)
select 'jay', 'smith', '8752228943', 'somewhere in hawaii', 1120, d_no
from novapark.department where d_name = 'sales'

select * from novapark.theme_event

delete from novap



select top 4 d_name, d_no from novapark.department

-- insert into novapark.staff (fname, lname) values ('jay', 'smith')

alter table novapark.resort_reservation
add CONSTRAINT chk_date CHECK (_date >= DATEADD(HOUR, 24, GETDATE()))

alter table novapark.restaurant_reservation
alter restaurant_no _no smallint no null

select d_no from novapark.department where d_name = 'legal'

select top 5 * from novapark.restaurant_reservation

select top 4 s.staff_no, s.phone_no, s.[address], s.week_wage, s.fname, s.lname, d.d_name
from novapark.staff as s inner join novapark.department as d
on s.dept_no = d.d_no

select * from novapark.staff where staff_no = 88


select * from novapark.[user]
where user_no = 2

select count(*) from novapark.owns_ticket

delete from novapark

select * from novapark.restaurant_reservation where ticket_no = 'nkXKD4Q'

delete from novapark.ticket where ticket_no = '1111111'

delete from novapark.visitor where first_name = 'john' and last_name = 'dagger'
--novapark.owns_ticket: (user_no, ticket_no)
--novapark.

alter table novapark.[user]
DROP COLUMN ticket_no;

alter table novapark.owns_ticket
alter column ticket_no nchar(7)

select _name, _no from novapark.restaurant order by _no

ALTER TABLE novapark.owns_ticket
ADD CONSTRAINT PK_userno PRIMARY KEY (user_no);

select t.ticket_no, t.t_type from novapark.owns_ticket as o inner join novapark.ticket as t on o.ticket_no = t.ticket_no where o.user_no = @user_no

alter table novapark.owns_ticket
alter column user_no int not null

DROP INDEX [user_no] ON novapark.owns_ticket;

select novapark.rr._date, novapark.rr.num_of_people, novapark.r._name
from novapark.restaurant as r inner join novapark.restaurant_reservation as rr on r._no = rr._no

ALTER TABLE novapark.owns_ticket
ADD CONSTRAINT FK_userno
FOREIGN KEY (user_no) REFERENCES novapark.[user](user_no);

alter table novapark.[user]
DROP CONSTRAINT FK__user__ticket_no__51300E55;

select count(*) from novapark.resort_reservation
--use this to rename column names
EXEC sp_rename 'novapark.restaurant_reservation.restaurant_no', '_no', 'COLUMN';

EXEC sp_rename 'novapark.restaurant_reservation.num_of_people', 'num_of_seats', 'COLUMN';

select top 1 suite_type from novapark.resort_reservation
where suite_type = 'Mini-suite'

select count(*) from novapark.restaurant_reservation

--trigger opportunity, launch a trigger when total number of
--people greater than capacity of a restaurant with restaurant_no
alter table novapark.restaurant_reservation
add num_of_people tinyint default 1
constraint chk_num_of_people check (num_of_people < 16);

delete from novapark.restaurant_reservation;

insert into novapark.restaurant_reservation 
(ticket_no, _no, _date, num_of_people) 
values 
(@ticket_no, @_no, @_date, @num_of_people)

select top 0 * from novapark.[user]
select top 0 * from novapark.visitor

select ticket_no from novapark.restaurant_reservation

select * from novapark.suite_and_prices

--4, 8, 12, 24
insert into novapark.resort_reservation
(ticket_no, _date, suite_type, stay_in_hours)
VALUES
('abcdef', '2023-11-25 14:35', 'Mini-suite', 4);

insert into novapark.resort_reservation
(ticket_no, _date, suite_type, stay_in_hours)
VALUES
('ujs6gww', '2023-11-28 09:35', 'Royal', 8);

select * from novapark.restaurant_reservation

insert into novapark.resort_reservation
(ticket_no, _date, suite_type, stay_in_hours)
VALUES
('7y4jurs', '2023-12-03 11:35', 'Mini-suite', 4);

insert into novapark.resort_reservation
(ticket_no, _date, suite_type, stay_in_hours)
VALUES
('gg636ge', '2023-11-29 05:35', 'Basic', 24);

select * from novapark.resort_reservation

select top 5 last_name from novapark.visitor

create table novapark.product 
(
    pname varchar(10) not null,
    pid tinyint not null,
    constraint chk_pname check (pname in ('Restaurant', 'resort', 'ticket'))
)

insert into novapark.product
(pname, pid) values ('ticket', 3)

select * from novapark.product

-- Transactions:

-- transaction_id (Primary Key)
-- visitor_id
-- transaction_date
-- amount

insert into novapark.purchase
(

) values (

);

create table novapark.purchase
(
    _no int IDENTITY(1,1) primary key,
    visitor_no int not null,
    _date datetime not null,
    amount numeric(5,2) not null,
    product_id tinyint not null
);

alter table novapark.purchase
alter column amount numeric(5,2)

-- Inserting 50 random rows into the 'novapark.purchase' table
DECLARE @counter INT = 1
declare @visitor int = 57

select count(*) from novapark.purchase

select top 10 * from novapark.visitor order by visitor_no;
select top 10 * from novapark.purchase order by visitor_no;

select _no from novapark.purchase where product_id != 3

update novapark.purchase
set amount = 25.00 where amount is null

select ride_no from novapark.amusement_ride

alter table novapark.ride_entry
add constraint chk_ride_no check (ride_no > 0 and ride_no <= 18)

declare @counter int = 1

select count(*) from novapark.ride_entry



delete from novapark.ride_entry

select * from novapark.amusement_ride

EXEC sp_rename 'novapark.purchase.price', 'amount', 'COLUMN';


select top 3 _date from novapark.purchase order by _date

JOIN (
    SELECT
        MAX(Amount) AS Max_Amount,
        MAX(Date) AS Max_Amount_Date
    FROM
        Transactions
) AS MAX_Date ON Transactions.Amount = MAX_Date.Max_Amount


declare @start_date date = '2023-01-01'; -- Replace with user input for start date
declare @end_date date = '2023-12-31'; -- Replace with user input for end date

SELECT
    product.pname,
    SUM(purchase.amount) AS total_revenue,
    AVG(purchase.amount) AS average
    -- MAX_Date.Max_Amount_Date AS Date_Of_Max_Amount
FROM
    novapark.purchase as purchase inner join novapark.product as product on purchase.product_id = product.pid
    -- inner join ( SELECT MAX(amount) AS Max_Amount, MAX(convert(date, _date)) AS Max_Amount_Date FROM purchase ) AS MAX_Date ON product.amount = MAX_Date.Max_Amount   
WHERE
    -- Type IN ('Ticket', 'Merchandise', 'Food') -- Adjust types as needed
    convert(date, _date) BETWEEN @start_date AND @end_date
GROUP BY
    product.pname;


-- RideMaintenance:

-- Maintenance_ID (Primary Key)
-- Ride_ID (Foreign Key referencing Rides table)
-- Maintenance_Date
-- Description
-- Status (e.g., 'Scheduled', 'In Progress', 'Completed')

create table novapark.ride_maintenance (
    _no int identity(1,1) primary key,
    ride_no SMALLINT not null,
    _date datetime not null,
    _desc varchar(150),
    _status char(11) default 'Scheduled',

)

create table novapark.maintain_log (
    _no int identity(1,1) primary key,
    maintain_no int not null,
    technician_no smallint not null,
    _date datetime
);

select top 10 _no from novapark.maintain_log

alter table novapark.maintain_log
alter column technician_no int

declare @i smallint = 3171

while @i < 3189
BEGIN
update novapark.maintain_log
set maintain_no = @i where _no = (@i - 3170)
set @i = @i + 1
end;

select * from novapark.ride_maintenance

insert into novapark.maintain_log (technician_no, _date) 
select staff_no, dateadd(day, -ABS(CHECKSUM(NEWID())) % 365, getdate())
from novapark.technician

update novapark.maintain_log
set novapark.maintain_log.maintain_no = novapark.ride_maintenance._no
from novapark.maintain_log join novapark.ride_maintenance on
novapark.maintain_log.maintain_no = novapark.ride_maintenance._no



select ride_no from novapark.amusement_ride

-- ABS(CHECKSUM(NEWID()))
declare @i smallint = 1;
while @i < 19
begin
insert into novapark.ride_maintenance (
    ride_no, _date, _status
) values (
    @i,
    dateadd(day, -ABS(CHECKSUM(NEWID())) % 365, getdate()),
    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 'Scheduled'
        WHEN 1 THEN 'Completed'
        WHEN 2 THEN 'In progress'
        WHEN 3 THEN 'Scheduled'
    END
)
set @i = @i + 1
end;

delete from novapark.ride_maintenance


SELECT 
        T.Technician_ID,
        T.Technician_Name,
        COUNT(ML.Log_ID) AS Tasks_Count
    FROM 
        Technicians T
    LEFT JOIN 
        MaintenanceLogs ML ON T.Technician_ID = ML.Technician_ID
    WHERE 
        T.Technician_Name = @TechnicianName
        AND ML.Log_Timestamp BETWEEN @StartDate AND @EndDate
    GROUP BY 
        T.Technician_ID, T.Technician_Name;


SELECT T.staff_no, T._name, COUNT(ML._no) AS Tasks_Count
FROM novapark.technician T
LEFT JOIN novapark.maintain_log ML ON T.staff_no = ML.technician_no
WHERE T._name = 'Martin' AND convert(date, ML._date) BETWEEN convert(date, '2022-07-09') AND convert(date, '2023-10-10')
GROUP BY T.staff_no, T._name;

select top 4 _name from novapark.technician

delete from novapark.[user]

alter table novapark.is_visitor
drop constraint fk_iv_userno

alter table novapark.owns_ticket
drop constraint FK_userno

select * from novapark.[user]

select top 4 * from novapark.technician
select top 4 * from novapark.maintain_log

select _name from novapark.technician

alter table novapark.theme_event
alter column img_path varchar(300)

alter table novapark.theme_event
drop constraint DF__theme_eve__thumb__2645B050

update novapark.theme_event
set img_path = 'https://bigalcharityhunt.com/wp-content/uploads/2022/07/BigAlCharityHunt-Website-Header-Logo-Retina.png'
where event_no = 6;
select * from novapark.theme_event;


select count(*) from novapark.staff

insert into novapark.technician
select staff_no, lname from novapark.staff where dept_no = 7

delete from novapark.technician

update novapark.staff
set dept_no = 7 where dept_no = 9 or dept_no = 3


select d_name, d_no from novapark.department

create table novapark.technician (
    staff_no smallint not null,
    _name varchar(15) not null
)

alter table novapark.ride_maintenance
add constraint chk_status check (_status in ('Scheduled', 'Completed', 'In progress', 'None'))

-- MaintenanceLogs:

-- Log_ID (Primary Key)
-- Maintenance_ID (Foreign Key referencing RideMaintenance)
-- Technician_ID (Foreign Key referencing Technicians/Employees)
-- Log_Timestamp


CREATE TABLE GuestEntries (
    Entry_ID INT PRIMARY KEY,
    Ride_ID INT,
    Guest_ID INT,
    Entry_Timestamp DATETIME,
    Exit_Timestamp DATETIME,
    Wait_Time INT,
    FOREIGN KEY (Ride_ID) REFERENCES Rides(Ride_ID),
    -- Other guest entry details...
);

select * from novapark.[user]

SELECT
    R.ride_no as ride_no,
    R.ride_name as ride_name,
    COUNT(GE.ticket_no) AS total_entries
FROM
    novapark.amusement_ride as R
LEFT JOIN
    novapark.ride_checkin as GE ON R.ride_no = GE.ride_no
WHERE
    GE._date BETWEEN '${startDate}' AND '${endDate}'
GROUP BY
    R.ride_no, R.ride_name;

select count(*) from novapark.ride_checkin

alter table novapark.ride_checkin
add wait_time smallint default 0

create table novapark.







declare @start_date date = '2023-01-01'; -- Replace with user input for start date
declare @end_date date = '2023-12-31'; -- Replace with user input for end date

SELECT
    product.pname,
    SUM(purchase.amount) AS total_revenue,
    AVG(purchase.amount) AS average,
    MAX_Date.Max_Amount_Date AS Date_Of_Max_Amount
FROM
    novapark.purchase as purchase
    inner join novapark.product as product on purchase.product_id = product.pid
    inner join ( SELECT MAX(amount) AS Max_Amount, MAX(convert(date, _date)) AS Max_Amount_Date FROM purchase ) AS MAX_Date ON purchase.amount = MAX_Date.Max_Amount   
WHERE
    convert(date, _date) BETWEEN @start_date AND @end_date
GROUP BY
    product.pname;





alter table novapark

SELECT
    Type,
    SUM(Amount) AS Total_Revenue
FROM
    Transactions
WHERE
    Type IN ('Ticket', 'Merchandise', 'Food') -- Adjust types as needed
GROUP BY
    Type;





-- while @counter <= 60
select top 4 * from novapark.ride_entry

insert into novapark.ride_checkin (ticket_no, ride_no, _date)
select ticket_no, ABS(CHECKSUM(NEWID())) % 18 + 1, DATEADD(day, -60 + ABS(CHECKSUM(NEWID())) % 60 + 1, GETDATE()) from novapark.ticket
-- SET @counter = @counter + 1

insert into novapark.ticket_purchase (ticket_no, _date)
select ticket_no, DATEADD(day, -60 + ABS(CHECKSUM(NEWID())) % 60 + 1, GETDATE()) from novapark.ticket 

create table novapark.ticket_purchase ( ticket_no nchar(7), _date datetime )

select count(*) from novapark.restaurant_reservation

alter table novapark.resort_reservation
add is_valid bit default 1

WHILE @counter <= 53
BEGIN
    INSERT INTO novapark.purchase (visitor_no, _date, product_id)
    VALUES (
        -- ABS(CHECKSUM(NEWID())) % 110 + 57, -- Random visitor number between 57 and 110
        @visitor,
        DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 365, GETDATE()), -- Random date within the last year
        -- ABS(CHECKSUM(NEWID())) % 100, -- Random amount between 0 and 1000
        ABS(CHECKSUM(NEWID())) % 3 + 1 -- Random product ID between 1 and 10
    )

    SET @counter = @counter + 1
    SET @visitor = @visitor + 1
END

select count(*) from novapark.ride_entry

update novapark.purchase
set amount = 3
where product_id != 3

select * from novapark.ticket_prices;
select * from novapark.product

create table novapark.ride_checkin (
    ticket_no nchar(7) not null,
    ride_no smallint not null,
    _date datetime not null
);

select convert(DATE, _date) as converted_date, count(distinct visitor_no) as visitors
from novapark.purchase
group by convert(DATE, _date)
order by converted_date;

UPDATE novapark.purchase
SET amount = 
    CASE ABS(CHECKSUM(NEWID())) % 3
        WHEN 0 THEN 25.0
        WHEN 1 THEN 55.5
        WHEN 2 THEN 99.5
        WHEN 3 THEN 25.0
    END
    where amount is null;
--  select 1 from novapark.purchase where product_id > 3

delete from novapark.purchase

select * from novapark.ticket_prices

insert into novapark.ticket_prices (
    t_type, price
) values ('platinum', 99.5)






select top 6 * from novapark.purchase

update novapark.product set pname = 'restaurant' where pname = 'Restaurant'

alter table novapark.visitor
add gender bit
alter table novapark.visitor
add income NUMERIC(9,2)

alter table novapark.visitor
drop column gender

--Basic, Presidential, Royal, Mini-suite
--4, 8, 12, 24
insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours)
values ('22e2sdd', '2023-11-27 14:35', 'Basic', 12);
insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours)
values ('hhdy73d', '2023-11-25 14:35', 'Presidential', 8);
insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours)
values ('876eyge', '2023-11-30 09:35', 'Royal', 4);
insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours)
values ('883h7e2', '2023-11-26 14:35', 'Royal', 4);
insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours)
values ('997du2e', '2023-11-29 14:35', 'Basic', 8);

insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people)
values ('lbcfger', 7, '2023-11-25 14:35', 3);
insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people)
values ('jfg657y', 7, '2023-11-26 14:35', 2);
insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people)
values ('6hryr7h', 7, '2023-11-29 17:35', 3);
insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people)
values ('663geuu', 7, '2023-11-30 09:35', 1);

select _name, open_time, close_time from novapark.restaurant

insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people)
values ('ab43eds', 7, '2023-11-25 14:35', 1)

select ticket_no from novapark.restaurant_reservation

delete from novapark.restaurant_reservation where ticket_no = 'lbcfger'

select ticket_no, _date, num_of_people
from novapark.restaurant as r inner join novapark.restaurant_reservation as rr
on r._no = rr._no
where r._name = 'Adventura Munchies';

select * from novapark.ticket

insert into novapark.purchase


select count(*) from novapark.theme_event

INSERT INTO novapark.ticket (ticket_no)
SELECT ticket_no
FROM novapark.visitor where ticket_no != 'Q5USevU';

alter table 

select ride_name, ride_no from novapark.amusement_ride

select _name from novapark.restaurant where _no = 7

select * from novapark.ticket

select top 5 _name, _no from novapark.restaurant;


alter table novapark.visitor
alter column ticket_no nchar(7)

select top 5 _date from novapark.restaurant_reservation

--1142999
select ticket_no from novapark.visitor where visitor_no = 1

update novapark.visitor
set ticket_no = '1142999'
where visitor_no = 1

select rr._date, rr.suite_type, rr.stay_in_hours, v.first_name, v.last_name
 from novapark.resort_reservation as rr inner join novapark.visitor as v 
 on rr.ticket_no = v.ticket_no
where rr.ticket_no = 'nkXKD4Q'

select * from novapark.owns_ticket

--8
--9y5C5d8

select * from test.A;
select * from test.B;
select * from test.A as a
inner join test.B as b on a.colA = 10
where a.colA = 10


insert into test.B (colA, colB, colC) values (91, 18, 4)

select * from 


select count(*) from novapark.ticket

SELECT 1 FROM novapark.restaurant WHERE _no = @_no AND CONVERT(TIME, '" + formattedBookDate + "') BETWEEN open_time AND close_time AND '" + formattedBookDate + "' > GETDATE();

alter table novapark.owns_ticket
drop constraint FK_ticketno

delete from novapark.ticket where ticket_no = '9y5C5d8';
update novapark.owns_ticket set ticket_no = NULL where user_no = 8;
update novapark.visitor set ticket_no = NULL where ticket_no = '9y5C5d8';

select ticket_no from novapark.owns_ticket where ticket_no = '9y5C5d8'
select  ticket_no from novapark.ticket where ticket_no = '9y5C5d8';
select  ticket_no from novapark.visitor where ticket_no = '9y5C5d8';


alter table novapark.restaurant_reservation
add constraint chk_restaurant_date
check (_date >= GETDATE())

--9y5C5d8

delete from novapark.restaurant_reservation


-- '2023-11-24 15:35'
select top 1 1 from novapark.resort_reservation where (DATEDIFF(HOUR, '2023-11-24 19:35', '2023-11-24 22:35') > 2)

select 1 from novapark.restaurant_reservation where ticket_no = '9y5C5d8'

select _date, ticket_no from novapark.resort_reservation where (DATEDIFF(HOUR, _date, '2023-11-25 16:36') > 24) and ticket_no = '9y5C5d8'
-- and (ticket_no = @ticket_no)


--nkXKD4Q
-- user_no = 3
-- delete from novapark.resort_reservation where ticket_no = 'nkXKD4Q';
-- delete from novapark.restaurant_reservation where ticket_no = 'nkXKD4Q';
-- delete from novapark.owns_ticket;
-- delete from novapark.ticket where ticket_no = 'nkXKD4Q';
-- delete from novapark.[user] where user_no = 3;
-- delete from novapark.visitor where ticket_no = 'nkXKD4Q';

-- delete from novapark.ticket;
-- delete from novapark.visitor;
-- delete from novapark.owns_ticket;
-- delete from novapark.is_visitor;

--NT4Y1fj
--gold

insert into novapark.[user] (privilege_type, email, passkey, first_name, last_name)
values (4, 'pos@npark.com', 'skyblue123', 'anders', 'kol')
-- select * from novapark.resort_reservation

delete from novapark.ticket where ticket_no = 'NT4Y1fj';

update novapark.owns_ticket set ticket_no = NULL where user_no = 4

update novapark.visitor set ticket_no = NULL where ticket_no = 'NT4Y1fj';

update novapark.[user] set passkey = 'abc123' where user_no = 4 and passkey = 'lote123';
select * from novapark.[user];


select * from novapark.owns_ticket;
select * from novapark.visitor;



alter table novapark.is_visitor
drop constraint fk_iv_visitorno




select * from novapark.owns_ticket 


create table novapark.is_visitor (
    user_no int primary key,
    visitor_no int unique not null,
    constraint fk_iv_userno foreign key (user_no) REFERENCES novapark.[user](user_no),
    constraint fk_iv_visitorno foreign key (visitor_no) REFERENCES novapark.visitor(visitor_no)
);

insert into 
novapark.is_visitor (user_no, visitor_no)
 select @user_no, visitor_no
 from novapark.visitor where ticket_no = @ticket_no;

create table test.B (
    colA smallint,
    colB smallint,
    colC smallint
)

select * from test.A;
select * from test.B;

update test.B
set colA = 10, colB = 11, colC = 12

insert into test.A (
    colA, colB, colC
) select colA, colB, 20 from test.B

delete from test.B

select * from novapark.visitor where ticket_no = 'nkXKD4Q';

SELECT 1
FROM novapark.restaurant_reservation as restaurant
INNER JOIN novapark.resort_reservation as resort ON restaurant.ticket_no = resort.ticket_no
WHERE (restaurant._date is not null) and (resort._date is not null) and DATEDIFF(HOUR, restaurant._date, t2.YourDateTimeColumn) > 24;

select top 5 ticket_no from novapark.resort_reservation where (DATEDIFF(HOUR, '2023-11-23 23:30', _date) > 24);
select top 15 ticket_no from novapark.resort_reservation

alter table novapark.resort_reservation
alter column _date datetime

alter table novapark.resort_reservation
drop constraint chk_date

select 1 from novapark.restaurant

delete from novapark.restaurant_reservation

select _name, _no, open_time, close_time from novapark.restaurant --YYYY-MM-DD hh:mm:ss[.nnn]

SELECT 1 FROM novapark.restaurant WHERE _no = 8 AND CONVERT(TIME, '2023-11-20T17:15') BETWEEN open_time AND close_time

SELECT 1 FROM novapark.restaurant WHERE _no = 8 AND CONVERT(TIME, '2023-11-22 17:42') BETWEEN open_time AND close_time AND '2023-11-21 13:18' > GETDATE()

select * from novapark.restaurant_reservation

select open_time, close_time from novapark.restaurant;

insert into novapark.restaurant_reservation (ticket_no, restaurant_no, _date, num_of_people)
 values (@ticket_no, @restaurant_no, @_date, @num_of_people)
 WHERE restaurant_no = @restaurant_no and CONVERT(TIME, @_date) BETWEEN open_time AND close_time

--YOOOOOOOOOOOOOOOOOO
SELECT capacity
FROM novapark.restaurant_reservation as rr
INNER JOIN novapark.restaurant as r ON CONVERT(TIME, rr._date) BETWEEN r.open_time AND r.close_time where 

select _name, open_time, close_time from novapark.restaurant WHERE _name = 'WonderWheels Diner' and CONVERT(TIME, '2023-12-17 22:00:00') BETWEEN open_time AND close_time

--YYYY-MM-DD hh:mm:ss[.nnn]
select _name, open_time, close_time from novapark.restaurant WHERE EXISTS (
    SELECT 1
    FROM novapark.restaurant
    WHERE CONVERT(TIME, '2023-12-17 21:00:00') BETWEEN open_time AND close_time
);
-- SELECT column1, column2
INSERT INTO rr (column1, column2)
FROM novapark.restaurant_reservation as rr inner join novapark.restaurant as r
on rr._no = r._no
WHERE YourCondition;

alter table novapark.restaurant
add constraint UC_name unique (_name)

alter table novapark.restaurant_reservation
alter column _date datetime

alter table novapark.restaurant_reservation drop constraint DF__restaurant__date__1DB06A4F

insert into novapark.restaurant (
    _name,
    img_path,
    capacity,
    _desc,
    open_time,
    close_time
) values (
    'CoasterBite Bistro',
    'https://www.themeparkinsider.com/photos/images/via-napoli.jpg',
    35,
    'Free burgers for first order on us',
    '07:30:00',
    '20:00:00'
)

select top 3 is_present from novapark.visitor

ALTER TABLE novapark.visitor
DROP CONSTRAINT DF__visitor__is_pres__2EDAF651;

alter table novapark.visitor
alter column is_present

select top 3 is_present from novapark.visitor
where is_present != 1

create table novapark.visitor_temp (
    visitor_no int identity(1,1) primary key,
    first_name nvarchar(15) not null,
    last_name nvarchar(15) not null,
    ticket_no nchar(7) not null unique,
    phone nchar(10),
    is_present bit not null,
    age tinyint not null,
    num_of_visitations smallint default 0,
    constraint chk_age check (age < 150),
    CONSTRAINT fk_ticket FOREIGN KEY (ticket_no) REFERENCES novapark.ticket(ticket_no)
)

insert into novapark.visitor_temp (
    first_name,
    last_name,
    ticket_no,
    phone,
    is_present,
    age,
    num_of_visitations
) select first_name,
    last_name,
    ticket_no,
    phone,
    is_present,
    age,
    num_of_visitations from novapark.visitor

select top 10 visitor_no from novapark.visitor

EXEC sp_rename '[novapark_2023-11-07T21-04Z ].novapark.[novapark.visitor]', 'visitor';

select top 5 * from novapark.visitor
drop table novapark.visitor

select top 1 age from novapark.visitor
where age is null

insert into novapark.ticket (
    ticket_no,
    t_type
) values (
    '1111111',
    'silver'
);
insert into novapark.visitor (
    first_name,
    last_name,
    ticket_no,
    phone,
    is_present,
    age,
    num_of_visitations
) values (
    'john',
    'dagger',
    '1111111',
    '8324941011',
    0,
    55,
    0
);
select top 1 * from novapark.visitor
order by visitor_no DESC

alter table novapark.resort_reservation
drop column room_no


create table novapark.restaurant_prices (
    _no smallint primary key,
    deposit 
)



-- Fantasy Bites
-- RollerGrill Eats
-- Adventura Munchies
-- Whirlwind Bistros
-- ThrillBite Treats
-- JourneyFuel Junction
-- WonderWheels Diner
-- Splash-n-Snacks Shack
-- AmazeMunch Cafe
-- CoasterBite Bistro

delete from novapark.restaurant

alter table novapark.restaurant
add rating numeric(2,1) default 0.0

alter table novapark.restaurant
add close_time time

insert into novapark.theme_event (
    _name,
    img_path,
    rating,

)


alter table novapark.theme_event
add event_date DATE

alter table novapark.theme_event
add event_no int IDENTITY(1,1) primary key

alter table novapark.theme_event
drop constraint PK_theme_event_event_no

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

UPDATE novapark.resort_reservation
set suite_type = 'Basic'
where suite_type is null

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

--DATEADD(HOUR, 248, GETDATE())
UPDATE novapark.resort_reservation
SET _date = DATEADD(HOUR, 248 + stay_in_hours, GETDATE())

alter table novapark.resort_reservation
alter column _date DATE

select * from novapark.suite_and_prices;


select top 3 * from novapark.resort_reservation;

select top 3 * from novapark.ticket;

select top 5 ticket_no, stay_in_hours, suite_type from novapark.resort_reservation;

