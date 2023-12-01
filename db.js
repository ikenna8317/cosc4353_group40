const sql = require('mssql');
const dbc = require('./db-config.js');
const crypto = require('crypto');
const isProduction = require('./nodeenv.js');

const pool = new sql.ConnectionPool(dbc.dbConfig);

async function loginUser(email, password) {
    const user = {};

    try {
        //SELECT * FROM users WHERE username = 'user1' AND password = 'hashed_password';
        const query = 'SELECT top 1 user_no, privilege_type, first_name, last_name FROM novapark.[user] WHERE email = @email AND passkey = @passkey';
        await pool.connect();
        const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('passkey', sql.NVarChar, password)
        .query(query);

        if (result.recordset.length > 0) {            
            user.userNo = result.recordset[0].user_no;
            user.privilege = result.recordset[0].privilege_type;
            user.fname = result.recordset[0].first_name;
            user.lname = result.recordset[0].last_name;
            user.loggedIn = true;

            console.log('User successfully logged in\n');
        } else {
            throw new Error('User could not login');
        }
        
    } catch (err) {
      console.error('Error:', err);
      user.loggedIn = false;
    } finally {
      pool.close();
    }
      return user;
}

async function addUser(fname, lname, email, password) {
    let userNo = -1;
    try {
      await pool.connect();
      let result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('passkey', sql.NVarChar, password)
      .input('first_name', sql.NVarChar, fname)
      .input('last_name', sql.NVarChar, lname)
      .query('insert into novapark.[user] (email, passkey, first_name, last_name) values (@email, @passkey, @first_name, @last_name); SELECT top 1 user_no from novapark.[user] order by user_no desc;');

      userNo = result.recordset[0].user_no;

      // result = await pool.request()
      // .input('user_no', sql.Int, userNo)
      // .query('insert into novapark.owns_ticket (user_no, ticket_no) values (@user_no, NULL)');

      console.log("User successfully added!\n");
    } catch (err) {
      console.error('Error:', err);
    } finally {
      pool.close();
    }

    return userNo;
}

//{fname, lname, phone: req.body.phone, age: req.body.age, ticketOption: req.body.ticket_choice}
async function addTicketAndVisitor(input) {
  let wasSuccessful = true;
  try {
  //{visitorNo, wasSuccess}
  // findExistingVisitor(userNo)
    const vlookup = await findExistingVisitor(input.userNo);
    // if (!(vlookup.wasSuccess))
    //   throw new Error('Visitor lookup was not successful');

    //   delete from novapark.ticket where ticket_no = @ticket_no;
    //  update novapark.owns_ticket set ticket_no = NULL where user_no = @user_no;
    //  update novapark.visitor set ticket_no = NULL where ticket_no = @ticket_no;
    let query;
    if (vlookup.wasSuccess) {
      query = `
      insert into novapark.ticket (ticket_no, t_type) values (@ticket_no, @t_type);
      update novapark.visitor set ticket_no = @ticket_no where visitor_no = @visitor_no;
      update novapark.owns_ticket set ticket_no = @ticket_no where user_no = @user_no;
    `;
    } else {
      query = `
      insert into novapark.ticket (ticket_no,t_type) values (@ticket_no, @t_type);
      insert into novapark.visitor (first_name, last_name, ticket_no, phone, is_present, age, num_of_visitations) values (@first_name, @last_name, @ticket_no, @phone, @is_present, @age, @num_of_visitations);
      insert into novapark.owns_ticket (user_no, ticket_no) values (@user_no, @ticket_no);
      insert into novapark.is_visitor (user_no, visitor_no) select @user_no, visitor_no from novapark.visitor where ticket_no = @ticket_no;
    `;
    }

    const ticketNum = generateRandomString(7);

    let result;
    await pool.connect();

    if (vlookup.wasSuccess) {
      result = await pool.request()
      .input('ticket_no', sql.NChar(7), ticketNum)
      .input('t_type', sql.NVarChar(8), input.ticketOption)
      .input('visitor_no', sql.Int, vlookup.visitorNo)
      .input('user_no', sql.Int, input.userNo)
      .query(query);

    } else {
      result = await pool.request()
      .input('first_name', sql.NVarChar(15), input.fname)
      .input('last_name', sql.NVarChar(15), input.lname)
      .input('ticket_no', sql.NChar(7), ticketNum)
      .input('phone', sql.NChar(10), input.phone)
      .input('is_present', sql.Bit, 0)
      .input('age', sql.TinyInt, input.age)
      .input('num_of_visitations', sql.SmallInt, 0)
      .input('t_type', sql.NVarChar(8), input.ticketOption)
      .input('user_no', sql.Int, input.userNo)
      .query(query);
    }


  } catch (err) {
    console.error('Error:', err);
    wasSuccessful = false;

  } finally {
    pool.close();
  }
  return wasSuccessful;
}

async function addResortReservation(reservationInput, ticketNo) {
  const {bookDate, suiteChoice, hoursChoice} = reservationInput;
  const formattedBookDate = bookDate.replace('T', ' ');
  let wasSuccessful = true;
  let errMsg;

  try {
    //check if there is an existing resort reservation that is more than 24 hours 
    // let query = "select 1 from novapark.restaurant_reservation where (DATEDIFF(HOUR, _date, '" + formattedBookDate + "') > 24) and (ticket_no = @ticket_no)";
    // let result = await pool.request()
    // .input('ticket_no', sql.NChar(7), ticketNo)
    // .query(query);

    // if (result.recordset.length > 0) {
    //     errMsg = 'You cannot book a reservation that is more than 24 hours apart from another one';
    //     throw new Error('addRestaurantReservation: Tried to book reservations more than 24 hours apart!\n');
    // }

    const query = "insert into novapark.resort_reservation (ticket_no, _date, suite_type, stay_in_hours) values (@ticket_no, '" + formattedBookDate + "', @suite_type, @stay_in_hours)";
    await pool.connect();
    await pool.request()
    .input('ticket_no', sql.NChar(7), ticketNo)
    // .input('_date', sql.DateTime2(0), bookDate)
    .input('suite_type', sql.Char(12), suiteChoice)
    .input('stay_in_hours', sql.TinyInt, hoursChoice)
    .query(query);


  } catch (err) {
    errMsg = 'Unable to book a resort reservation. Check to make sure the date you entered follows our booking policy and try again';
    console.error('Error:', err);
    wasSuccessful = false;
  } finally {
    pool.close();
  }

  return {wasSuccessful, errMsg};

}

//{ bookDate, restaurantChoice, numOfSeats }
async function addRestaurantReservation(reservationInput, ticketNo) {
  const {bookDate, restaurantChoice, numOfSeats} = reservationInput;
  const formattedBookDate = bookDate.replace('T', ' ');
  let wasSuccessful = true;
  let errMsg = '';
  console.log(formattedBookDate);

  try {
    //check if there is an existing resort reservation that is more than 24 hours 
    // let query = "select 1 from novapark.resort_reservation where (DATEDIFF(HOUR, _date, '" + formattedBookDate + "') > 24) and (ticket_no = @ticket_no)";
    // let result = await pool.request()
    // .input('ticket_no', sql.NChar(7), ticketNo)
    // .query(query);

    // if (result.recordset.length > 0) {
    //     errMsg = 'You cannot book a reservation that is more than 24 hours apart from another one';
    //     throw new Error('addRestaurantReservation: Tried to book reservations more than 24 hours apart!\n');
    // }

    //lookup the restaurant no of the add restaurant choice 
    let query = 'select _no from novapark.restaurant where _name = @_name';
    await pool.connect()
    let result = await pool.request()
    .input('_name', sql.NVarChar(40), restaurantChoice)
    .query(query);

    const res_no = (result.recordset.length > 0) ? result.recordset[0]._no : -1;
    if (res_no === -1) {
      errMsg = 'The restaurant you selected was invalid!';
      throw new Error('addRestaurantReservation: Restaurant no is invalid!\n');
    }
    // console.log(res_no);
    //check to make sure the input time is not out of bounds
    // query = `SELECT 1 FROM novapark.restaurant WHERE (_no = @_no) AND CONVERT(TIME, ${formattedBookDate}) BETWEEN open_time AND close_time AND ${formattedBookDate} > GETDATE()`;
    // equery = "SELECT 1 FROM novapark.restaurant WHERE _no = 8 AND CONVERT(TIME, '2023-11-22 17:42') BETWEEN open_time AND close_time AND '2023-11-21 13:18' > GETDATE()";
    // await pool.connect()
    // query = "SELECT 1 FROM novapark.restaurant WHERE _no = @_no AND CONVERT(TIME, '" + formattedBookDate + "') BETWEEN open_time AND close_time AND '" + formattedBookDate + "' > GETDATE();";
    // result = await pool.request()
    // .input('_no', sql.SmallInt, res_no)
    // // .input('_date', sql.DateTime, formattedBookDate)
    // .query(query);

    // if (result.recordset.length === 0) {
    //   errMsg = 'The time you put is outside the business hours of the restaurant you selected!'
    //   throw new Error('addRestaurantReservation: The time you put in is outside the business hours of the restaurant you chose\n');
    // }


    query = "insert into novapark.restaurant_reservation (ticket_no, _no, _date, num_of_people) values (@ticket_no, @_no, '" + formattedBookDate + "', @num_of_people)";
    result = await pool.request()
    .input('ticket_no', sql.NChar(7), ticketNo)
    .input('_no', sql.SmallInt, res_no)
    // .input('_date', sql.DateTime, formattedBookDate)
    .input('num_of_people', sql.TinyInt, numOfSeats)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    errMsg = 'Unable to book a restaurant reservation. Check to make sure the date you entered follows our booking policy and try again';
    wasSuccessful = false;
  } finally {
    pool.close();
  }
  return {wasSuccessful, errMsg};

}

async function test() {

}

// async function getTicketHolder(ticket)
// SELECT *
// FROM Table1
// INNER JOIN Table2 ON Table1.ColumnA = Table2.ColumnB
// INNER JOIN Table3 ON Table2.ColumnC = Table3.ColumnD;
async function getTicketInfo(userNo) {
  const payload = {ticketNum: '', ticketType: '', wasSuccess: true};

  try {
    await pool.connect();
    let result = await pool.request()
    .input('user_no', sql.Int, userNo)
    .query(`
     select t.ticket_no, t.t_type, v.first_name, v.last_name from novapark.owns_ticket as o
     inner join novapark.ticket as t on o.ticket_no = t.ticket_no
     inner join novapark.visitor as v on t.ticket_no = v.ticket_no
     where o.user_no = @user_no
    `);

    if (result.recordset.length > 0) {
      payload.ticketNum = result.recordset[0].ticket_no;
      payload.ticketType = result.recordset[0].t_type;
      payload.fname = result.recordset[0].first_name;
      payload.lname = result.recordset[0].last_name;

    }
    else
      throw new Error('Could not find a ticket for current user');

  }
  catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
  } finally {
    pool.close();
  }

  return payload;
}

async function getResortReservation(ticketNo) {
  const payload = {wasSuccess: true};
  try {
    await pool.connect();
    result = await pool.request()
    .input('ticket_no', sql.NChar, ticketNo)
    .query('select _date, suite_type, stay_in_hours from novapark.resort_reservation where ticket_no = @ticket_no');
    
    if (result.recordset.length > 0) {
      payload.bookDate = result.recordset[0]._date;
      payload.suiteType = result.recordset[0].suite_type;
      payload.stayInHours = result.recordset[0].stay_in_hours;
    }
    else 
      throw new Error('getResortReservation: Could not find a ticket for current user');

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
  } finally {
    pool.close();
  }

  return payload;
}

// select rr._date, rr.num_of_people, r._name
// from novapark.restaurant as r inner join novapark.restaurant_reservation as rr on r._no = rr._no
async function getRestaurantReservation(ticketNo) {
  let wasSuccess = true;
  const payload = {};
  try {
    await pool.connect();
    const result = await pool.request()
    .input('ticket_no', sql.NChar, ticketNo)
    .query('select rr._date, rr.num_of_people, r._name from novapark.restaurant as r inner join novapark.restaurant_reservation as rr on r._no = rr._no where rr.ticket_no = @ticket_no');
    
    if (result.recordset.length > 0) {
      payload.bookDate = result.recordset[0]._date;
      payload.numOfPeople = result.recordset[0].num_of_people;
      payload.restaurantName = result.recordset[0]._name;
    }
    else 
      throw new Error('getRestaurantReservation: Could not find a restaurant reservation for current user');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}
//{wasSuccess, bookDate, numOfPeople}
async function getRestaurantReservationFor(ticketNo, restaurantName) {
  const payload = {wasSuccess: true};
  try {
    await pool.connect();
    const result = await pool.request()
    .input('ticket_no', sql.NChar, ticketNo)
    .input('_name', sql.NVarChar(40), restaurantName)
    .query('select rr._date, rr.num_of_people from novapark.restaurant as r inner join novapark.restaurant_reservation as rr on r._no = rr._no where rr.ticket_no = @ticket_no and r._name = @_name');
    
    if (result.recordset.length > 0) {
      payload.bookDate = result.recordset[0]._date;
      payload.numOfPeople = result.recordset[0].num_of_people;
    }
    else 
      throw new Error('getRestaurantReservationFor: Could not find reservation at ' + reservationName + ' for current user\n');

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
  } finally {
    pool.close();
  }

  return payload;
}

// { book_date, restaurant_choice, num_seats } 
async function updateRestaurantReservation(ticketNo, newInfo) {
  const { book_date, restaurant_choice, num_seats } = newInfo;
  const formattedDate = book_date.replace('T', ' ');
  let payload = {wasSuccess: true, errMsg: ''};

  try {
    const query = `
      declare @res_no SMALLINT;

      select @res_no = _no
      from novapark.restaurant where _name = @_name;

      update novapark.restaurant_reservation
      set _date = @_date, _no = @res_no, num_of_people = @num_of_people
      where ticket_no = @ticket_no;
    `;
    await pool.connect();
    await pool.request()
    .input('_name', sql.NVarChar(40), restaurant_choice)
    .input('_date', sql.DateTime, formattedDate)
    .input('num_of_people', sql.TinyInt, num_seats)
    .input('ticket_no', sql.NChar(7), ticketNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
    payload.errMsg = err;
  } finally {
    pool.close();
  }
  return payload;
}

async function updateResortReservation(ticketNo, newInfo) {
  const { book_date, suite_choice, hours_choice } = newInfo;
  const formattedDate = book_date.replace('T', ' ');
  let payload = {wasSuccess: true, errMsg: ''};

  try {
    const query = `
      update novapark.resort_reservation
      set _date = @_date, suite_type = @suite_type, stay_in_hours = @stay_in_hours
      where ticket_no = @ticket_no
    `;
    await pool.connect();
    await pool.request()
    .input('_date', sql.DateTime, formattedDate)
    .input('suite_type', sql.Char(12), suite_choice)
    .input('stay_in_hours', sql.TinyInt, hours_choice)
    .input('ticket_no', sql.NChar(7), ticketNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
    payload.errMsg = err;
  } finally {
    pool.close();
  }
  return payload;
}

async function removeReservation(ticketNo, isResort=true) {
  let errMsg = '';
  try {
    await pool.connect();
    let result, query;

    if (isResort)
      query = 'delete from novapark.resort_reservation where ticket_no = @ticket_no';
    else 
      query = 'delete from novapark.restaurant_reservation where ticket_no = @ticket_no';

    result = await pool.request()
    .input('ticket_no', sql.NChar(7), ticketNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    errMsg = 'Could not remove reservation, try again later.';
  } finally {
    pool.close();
  }
  return errMsg;
}

// --nkXKD4Q
// -- user_no = 3
// -- delete from novapark.resort_reservation where ticket_no = 'nkXKD4Q';
// -- delete from novapark.restaurant_reservation where ticket_no = 'nkXKD4Q';
// -- delete from novapark.owns_ticket;
// -- delete from novapark.ticket where ticket_no = 'nkXKD4Q';
// -- delete from novapark.[user] where user_no = 3;
// -- delete from novapark.visitor where ticket_no = 'nkXKD4Q';
async function removeTicket(ticketNo, userNo) {
  let errMsg = '';
  try {
    //if operation returns an error message, something went wrong
    if ((await removeReservation(ticketNo, true))) {
      errMsg = 'Unable to remove resort reservation';
      throw new Error(errMsg);
    }

    if ((await removeReservation(ticketNo, false))) {
      errMsg = 'Unable to remove restaurant reservation';
      throw new Error(errMsg);
    }

    const query = `
     delete from novapark.ticket where ticket_no = @ticket_no;
     update novapark.owns_ticket set ticket_no = NULL where user_no = @user_no;
     update novapark.visitor set ticket_no = NULL where ticket_no = @ticket_no;
    `;
    await pool.connect();
    await pool.request()
    .input('ticket_no', sql.NChar(7), ticketNo)
    .input('user_no', sql.Int, userNo)
    .query(query);
  }
  catch (err) {
    console.error('Error:', err);
    errMsg = 'Unable to refund your ticket! Try again later';
  } finally {
    pool.close();
  }
  return errMsg;
}

async function getAllRestaurantReservations(name) {
  let reservations = null;
  let wasSuccess = true;
  try {
    const query = `
      select ticket_no, _date, num_of_people
      from novapark.restaurant as r inner join novapark.restaurant_reservation as rr
      on r._no = rr._no
      where r._name = @_name;
    `;
    await pool.connect();
    const result = await pool.request()
    .input('_name', sql.NVarChar(40), name)
    .query(query);
  
    if (result.recordset.length > 0)
      reservations = result.recordset;
    else
      throw new Error('Not one reservation was found');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
    } finally {
    pool.close();
  }

  return {wasSuccess, reservations};
}


async function getAllResortReservations() {
  let reservations = null;
  let wasSuccess = true;
  try {
    const query = `
      select * from novapark.resort_reservation;
    `;

    await pool.connect();
    const result = await pool.request()
    .query(query);

    if (result.recordset.length > 0)
      reservations = result.recordset;
    else
      throw new Error('Not one reservation was found');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
    } finally {
    pool.close();
  }

  return {wasSuccess, reservations};
}

async function getRestaurantNo(name) {
  let wasSuccess = true;
  let no;

  try {
    //.input('ticket_no', sql.NChar(7), ticketNo)
    await pool.connect();
    const result = await pool.request()
    .input('_name', sql.NVarChar(40), name)
    .query('select _no from novapark.restaurant where _name = @_name');

    if (result.recordset.length > 0) 
      no = result.recordset[0]._no;
    else
      throw new Error('Unable to find restaurant with identifier ' + no);

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, no};
}

async function loadRestaurantNames() {
  let wasSuccess = true;
  let restaurantList;

  try {
    await pool.connect();
    result = await pool.request()
    .query('select _name from novapark.restaurant');

    if (result.recordset.length > 0) 
      restaurantList = result.recordset;
    else
      throw new Error('loadRestaurantNames: No restaurant was found in the DB');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, restaurantList};
}

//returns {email, fname, lname}
async function getProfile(userNo) {
  const payload = {wasSuccess: true};
  try {
    const query = `
    select first_name, last_name, email
    from novapark.[user]
    where user_no = @user_no
  `;

    await pool.connect();
    const result = await pool.request()
    .input('user_no', sql.Int, userNo)
    .query(query);

    if (result.recordset.length > 0) {
      payload.fname = result.recordset[0].first_name;
      payload.lname = result.recordset[0].last_name;
      payload.email = result.recordset[0].email;
    } else {
      payload.errMsg = 'Unable to retrieve user info';
      throw new Error(payload.errMsg);    
    }

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
  } finally {
    pool.close();
  }

  return payload;
}

async function updateProfile(userNo, newInfo) {
  const {email, fname, lname} = newInfo;
  let wasSuccess = true;
  let errMsg;

  try {
    const query = `
      update novapark.[user]
      set email = @email, first_name = @first_name, last_name = @last_name
      where user_no = @user_no
    `;

    await pool.connect();
    await pool.request()
    .input('email', sql.VarChar(50), email)
    .input('first_name', sql.VarChar(15), fname)
    .input('last_name', sql.VarChar(15), lname)
    .input('user_no', sql.Int, userNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    errMsg = err;
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return {wasSuccess, errMsg};
}

async function updatePassword(userNo, newPassword, currPassword) {
  let wasSuccess = true;
  let errMsg;

  try {
    const query = `
      update novapark.[user]
      set passkey = @passkey
      where user_no = @user_no and passkey = @curr_passkey;
      select 1
      from novapark.[user]
      where user_no = @user_no and passkey = @passkey;
    `;

    await pool.connect();
    const result = await pool.request()
    .input('passkey', sql.VarChar(50), newPassword)
    .input('curr_passkey', sql.VarChar(50), currPassword)
    .input('user_no', sql.Int, userNo)
    .query(query); 

    if (result.recordset.length == 0) {
      errMsg = 'The email or password you entered is invalid';
      throw new Error('invalid user name or password');
    }

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return {wasSuccess, errMsg};
}

//utility functions
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Character set
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charactersLength); // Generate random index
    result += characters.charAt(randomIndex); // Get character at random index
  }
  return result;
}

//{visitorNo, fname, lname, ticketNo, phone, age, wasSuccess}
async function findExistingVisitor(userNo) {
  const payload = {visitorNo: null, wasSuccess: true};

  try {
    const query = `
      select v.visitor_no, v.first_name, v.last_name, v.ticket_no, v.phone, v.age
      from novapark.visitor as v inner join novapark.is_visitor as iv on v.visitor_no = iv.visitor_no
      where iv.user_no = @user_no;
    `;

    await pool.connect();
    const result = await pool.request()
    .input('user_no', sql.Int, userNo)
    .query(query);

    if (result.recordset.length > 0) {
      payload.visitorNo = result.recordset[0].visitor_no;
      payload.fname = result.recordset[0].first_name;
      payload.lname = result.recordset[0].last_name;
      payload.ticketNo = result.recordset[0].ticket_no;
      payload.phone = result.recordset[0].phone;
      payload.age = result.recordset[0].age;

    }
     else
      throw new Error('Unable to find existing visitor');

  } catch (err) {
    console.error('Error:', err);
    payload.wasSuccess = false;
  } finally {
    pool.close();
  }
  return payload;
}

async function updateVisitor(userNo, info) {
  const {fname, lname, phone, age} = info;
  let wasSuccess = true;

  try {
    const query = `
      update novapark.visitor
      set first_name = @first_name, last_name = @last_name, phone = @phone, age = @age
      from novapark.is_visitor as iv
      inner join novapark.visitor as v on iv.visitor_no = v.visitor_no
      where iv.user_no = @user_no;
    `;
    await pool.connect();
    const result = await pool.request()
    .input('first_name', sql.NVarChar(15), fname)
    .input('last_name', sql.NVarChar(15), lname)
    .input('phone', sql.NChar(10), phone)
    .input('age', sql.TinyInt, age)
    .input('user_no', sql.Int, userNo)
    .query(query);


  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return wasSuccess;
}

async function getSuiteInfo() {
  let wasSuccess = true;
  let payload;
  
  try {
    const query = `
      select * from novapark.suite_and_prices;
    `;

    await pool.connect();
    const result = await pool.request()
    .query(query);

    if (result.recordset.length > 0) 
      payload = result.recordset;
    else 
      throw new Error('Unable to get a single suite info');
    

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

async function getRides(detailed=false) {
  let wasSuccess = true;
  let payload;
  try {
    const query = `
    select ride_name, ride_no
    from novapark.amusement_ride
  `;

  await pool.connect();
  const result = await pool.request()
  .query(query);

  if (result.recordset.length > 0) 
    payload = result.recordset;
  else
    throw new Error('Not a single ride was returned');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}


//reports
async function ridePopularityReport(startDate, endDate, rideName) {
  let wasSuccess = true;
  let payload;

  try {
    startDate = startDate.replace('T', ' ');
    endDate = endDate.replace('T', ' ');

    const query = `
      SELECT a.ride_name,
      COUNT(DISTINCT re.ticket_no) AS total_visitors
      FROM novapark.ride_checkin as re
      JOIN novapark.amusement_ride as a ON re.ride_no = a.ride_no
      JOIN novapark.visitor as v ON re.ticket_no = v.ticket_no
      WHERE a.ride_name = @ride_name
      AND re._date BETWEEN CONVERT(DATE, '${startDate}') AND CONVERT(DATE,'${endDate}')
      GROUP BY a.ride_name;
    `;

    await pool.connect();
    const result = await pool.request()
    .input('ride_name', sql.NVarChar(30), rideName)
    .query(query);

    payload = result.recordset;

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

async function revenueReport(startDate, endDate) {
  let wasSuccess = true;
  let payload;

  try {
    startDate = startDate.replace('T', ' ');
    endDate = endDate.replace('T', ' ');

    const query = `
    SELECT
      product.pname as pname,
      SUM(purchase.amount) AS total_revenue,
      AVG(purchase.amount) AS average
  FROM
      novapark.purchase as purchase inner join novapark.product as product on purchase.product_id = product.pid
  WHERE
      convert(date, _date) BETWEEN '${startDate}' AND '${endDate}'
  GROUP BY
      product.pname;
    `;

    await pool.connect();
    const result = await pool.request()
    .query(query);

    payload = result.recordset;

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}


// SELECT T.staff_no, T._name, COUNT(ML._no) AS Tasks_Count
// FROM novapark.technician T
// LEFT JOIN maintain_log ML ON T.staff_no = ML.technician_no
// WHERE T._name = @name AND convert(date, ML._date) BETWEEN convert(date, @startDate) AND convert(date, @endDate)
// GROUP BY T.staff_no, T._name;

async function technicianWorkloadReport(input) {
  let wasSuccess = true;
  let { name, startDate, endDate } = input;
  let payload;

  try {
    startDate = startDate.replace('T', ' ');
    endDate = endDate.replace('T', ' ');

    const query = `
      SELECT T.staff_no, T._name, COUNT(ML._no) AS Tasks_Count
      FROM novapark.technician T
      LEFT JOIN novapark.maintain_log ML ON T.staff_no = ML.technician_no
      WHERE T._name = @name AND convert(date, ML._date) BETWEEN convert(date, '${startDate}') AND convert(date, '${endDate}')
      GROUP BY T.staff_no, T._name;
    `;

    await pool.connect();
    const result = await pool.request()
    .input('name', sql.VarChar(15), name)
    .query(query);

    payload = result.recordset;

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

// {wasSuccess, payload}
async function getTechnicians() {
    let wasSuccess = true;
    let payload;

    try {
      const query = `
        select _name from novapark.technician
      `;

      await pool.connect();
      const result = await pool.request()
      .query(query);

      if (result.recordset.length < 0)
          throw new Error('Unable to get list of technicians');
          
      payload = result.recordset;

    } catch (err) {
      console.error('Error:', err);
      wasSuccess = false;
    } finally {
      pool.close();
    }
  
    return {wasSuccess, payload};
}


async function rideUsageReport(startDate, endDate, rideName='', getAll=false) {
  let wasSuccess = true;
  let payload;

  try {
    startDate = startDate.replace('T', ' ');
    endDate = endDate.replace('T', ' ');

    let query;
    if (getAll) {
        query = `
                  SELECT
              R.ride_name as ride_name,
              COUNT(GE.ticket_no) AS total_entries
          FROM
              novapark.amusement_ride as R
          LEFT JOIN
              novapark.ride_checkin as GE ON R.ride_no = GE.ride_no
          WHERE
              GE._date BETWEEN convert(date, '${startDate}') AND convert(date, '${endDate}')
          GROUP BY
              R.ride_no, R.ride_name;
        `;
    } else {
        query = `
                    SELECT
                R.ride_name as ride_name,
                COUNT(GE.ticket_no) AS total_entries
            FROM
                novapark.amusement_ride as R
            LEFT JOIN
                novapark.ride_checkin as GE ON R.ride_no = GE.ride_no
            WHERE
                GE._date BETWEEN '${startDate}' AND '${endDate}'
                AND R.ride_name = @ride_name
            GROUP BY
                R.ride_no, R.ride_name;
          `;
    }

    await pool.connect();
    const result = await pool.request()
    .input('ride_name', sql.NVarChar(30), rideName)
    .query(query);

    payload = result.recordset;

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

async function lookupStaffNo(fname, lname) {
  let wasSuccess = true;
  let no;

  try {
    const query = `select staff_no where fname = @fname and lname = @lname`;

    await pool.connect();
    const result = await pool.request()
    .input('fname', sql.NVarChar(15), fname)
    .input('lname', sql.NVarChar(15), lname)
    .query(query);

    if (result.recordset.length > 0)
      no = result.recordset[0].staff_no;
    else
      throw new Error('Could not find staff number');
  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, no};
}

async function lookupDeptNo(dname) {
  let wasSuccess = true;
  let dno;

  try {
    const query = `select d_no from novapark.department where d_name = @d_name`;

    await pool.connect();
    const result = await pool.request()
    .input('d_name', sql.NVarChar(15), dname)
    .query(query);

    if (result.recordset.length > 0)
      dno = result.recordset[0].d_no;
    else
      throw new Error('Could not find staff number');
  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, dno};
}


async function updateStaff(details) {
  let wasSuccess = true;

  try {
    const { no, phone, address, weekWage, department } = details;

    const { wasSuccess: wasSuccess2, dno } = await lookupDeptNo(department);
    if (!wasSuccess2)
      throw new Error('Unable to lookup department');

    const query = `
      update novapark.staff
      set phone_no = @phone_no, address = @address,
      week_wage = @week_wage, dept_no = @dept_no where staff_no = @staff_no
    `;
  
    await pool.connect();
    const result = await pool.request()
    .input('staff_no', sql.SmallInt, no)
    .input('phone_no', sql.NChar(10), phone)
    .input('address', sql.NVarChar(65), address)
    // .input('supervisor_no', sql.SmallInt, supervisor)
    .input('week_wage', sql.Decimal(7,2), weekWage)
    .input('dept_no', sql.SmallInt, dno)
    .query(query);


  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return wasSuccess;
}


//{ no, name, imgUrl, desc, date }
async function updateEvent(details) {
  let wasSuccess = true;

  try {
    let { no, name, imgUrl, desc, date } = details;
    date = date.replace('T', ' ');

    const query = `
      update novapark.theme_event
      set _name = @_name, img_path = @img_path,
      event_desc = @event_desc, event_date = '${date}' where event_no = @event_no
    `;
  
    await pool.connect();
    const result = await pool.request()
    .input('event_no', sql.SmallInt, no)
    .input('_name', sql.NVarChar(22), name)
    .input('img_path', sql.NVarChar(140), imgUrl)
    .input('event_desc', sql.VarChar(125), desc)
    // .input('event_date', sql.NVarChar(22), date)
    .query(query);


  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return wasSuccess;
}

//{ fname, lname, phone, address, weekWage, department }
async function addStaff(info) {
  let wasSuccess = true;
  const { fname, lname, phone, address, weekWage, department } = info;

  try {

    const query = `
      insert into novapark.staff (fname, lname, phone_no, address, week_wage, dept_no)
      select @fname, @lname, @phone_no, @address, @week_wage, d_no
      from novapark.department where d_name = @d_name
    `;
  
    await pool.connect();
    await pool.request()
    .input('fname', sql.NVarChar(15), fname)
    .input('lname', sql.NVarChar(15), lname)
    .input('phone_no', sql.NChar(10), phone)
    .input('address', sql.NVarChar(65), address)
    .input('week_wage', sql.Decimal(7,2), weekWage)
    .input('d_name', sql.NVarChar(15), department)
    .query(query);


  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return wasSuccess;
}

//{ name, imgUrl, desc, date }
async function addEvent(info) {
  let wasSuccess = true;
  let { name, imgUrl, desc, date } = info;
  date = date.replace('T', ' ');

  try {

    const query = `
      insert into novapark.theme_event (_name, img_path, event_desc, event_date)
      values (@_name, @img_path, @event_desc, '${date}')
    `;
  
    await pool.connect();
    await pool.request()
    .input('_name', sql.NVarChar(22), name)
    .input('img_path', sql.NVarChar(140), imgUrl)
    .input('event_desc', sql.VarChar(125), desc)
    .query(query);


  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }
  return wasSuccess;
}


// 'Staff no', 'First name', 'Last name'
async function getStaff(limit) {
  let wasSuccess = true;
  let payload;

  try {
    const limitPrefixer = limit ? `top ${limit}` : '';
    const query = `
      select ${limitPrefixer} s.staff_no, s.fname, s.lname, s.phone_no, s.[address], s.week_wage, d.d_name
      from novapark.staff as s inner join novapark.department as d
      on s.dept_no = d.d_no
    `;

    await pool.connect();
    const result = await pool.request()
    .query(query);

    if (result.recordset.length > 0)
      payload = result.recordset;
    else
      throw new Error('Could not find staff number');
  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

async function getEvents(limit, forHomePage=false) {
  let wasSuccess = true;
  let payload;

  try {
    const limitPrefixer = limit ? `top ${limit}` : '';
    let query;
    if (forHomePage) {
        query = `
          select ${limitPrefixer} _name, img_path, event_desc, event_date
          from novapark.theme_event
        `;
    } else {
        query = `
          select ${limitPrefixer} event_no, _name, event_date
          from novapark.theme_event
      `;
    }
    

    await pool.connect();
    const result = await pool.request()
    .query(query);

    if (result.recordset.length > 0)
      payload = result.recordset;
    else
      throw new Error('Could not get events');
  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, payload};
}

async function removeStaff(staffNo) {
  let wasSuccess = true;

  try {
    const query = `delete from novapark.staff where staff_no = @staff_no`;

    await pool.connect();
    await pool.request()
    .input('staff_no', sql.SmallInt, staffNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return wasSuccess;
}

async function removeEvent(eventNo) {
  let wasSuccess = true;

  try {
    const query = `delete from novapark.theme_event where event_no = @event_no`;

    await pool.connect();
    await pool.request()
    .input('event_no', sql.Int, eventNo)
    .query(query);

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return wasSuccess;
}

async function loadDepartments() {
  let wasSuccess = true;
  let departments;

  try {
    await pool.connect();
    result = await pool.request()
    .query('select d_name from novapark.department');

    if (result.recordset.length > 0) 
      departments = result.recordset;
    else
      throw new Error('Could not load departments');

  } catch (err) {
    console.error('Error:', err);
    wasSuccess = false;
  } finally {
    pool.close();
  }

  return {wasSuccess, departments};
}

module.exports = {
  test,
  addUser,
  loginUser,
  addTicketAndVisitor,
  getTicketInfo,
  addResortReservation,
  loadRestaurantNames,
  getRestaurantNo,
  addRestaurantReservation,
  getResortReservation,
  getRestaurantReservation,
  getRestaurantReservationFor,
  removeReservation,
  removeTicket,
  updateRestaurantReservation,
  updateResortReservation,
  updateProfile,
  updatePassword,
  getProfile,
  findExistingVisitor,
  updateVisitor,
  getAllRestaurantReservations,
  getAllResortReservations,
  getSuiteInfo,
  getRides,
  ridePopularityReport,
  revenueReport,
  technicianWorkloadReport,
  rideUsageReport,
  updateStaff,
  loadDepartments,
  getStaff,
  removeStaff,
  addStaff,
  getEvents,
  removeEvent,
  updateEvent,
  addEvent,
  getTechnicians
};

