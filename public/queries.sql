select top 1 * from novapark.ticket
select top 3 t_type from novapark.ticket;

alter table novapark.resort_reservation
add CONSTRAINT chk_date CHECK (_date >= DATEADD(HOUR, 24, GETDATE()))

alter table novapark.restaurant_reservation
alter restaurant_no _no smallint no null

select top 5 * from novapark.restaurant_reservation


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

alter table novapark.visitor
alter column ticket_no nchar(7)

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

