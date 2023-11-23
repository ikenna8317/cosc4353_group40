const sql = require('mssql');
const dbc = require('./db-config.js');
const crypto = require('crypto');

const pool = new sql.ConnectionPool(dbc.dbConfig);

async function loginUser(email, password) {
    const payload = {
        loggedIn: true,
        user: {
            privilege: -1,
            email: '',
            fname: '',
            lname: ''
        },
    }
    try {
        //SELECT * FROM users WHERE username = 'user1' AND password = 'hashed_password';
        const query = 'SELECT top 1 * FROM novapark.[user] WHERE email = @email AND passkey = @passkey';
        await pool.connect();
        const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('passkey', sql.NVarChar, password)
        .query(query);

        if (result.recordset.length > 0) {
            const userRow = result.recordset[0];
            
            payload.loggedIn = true;
            payload.user.privilege = userRow.privilege_type;
            payload.user.email = userRow.email;
            payload.user.fname = userRow.first_name;
            payload.user.lname = userRow.last_name;
            payload.user.userNo = userRow.user_no;
            console.log('User successfully logged in\n');
        } else {
            console.log('User could not login!\n');
            throw new Error('User could not login');
        }
        
    } catch (err) {
        console.error('Error:', err);
        payload.loggedIn = false;
      } finally {
        pool.close();
      }
      return payload;
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

      result = await pool.request()
      .input('user_no', sql.Int, userNo)
      .query('insert into novapark.owns_ticket (user_no, ticket_no) values (@user_no, NULL)');

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
    if (!(vlookup.wasSuccess))
      throw new Error('Visitor lookup was not successful');

    //   delete from novapark.ticket where ticket_no = @ticket_no;
    //  update novapark.owns_ticket set ticket_no = NULL where user_no = @user_no;
    //  update novapark.visitor set ticket_no = NULL where ticket_no = @ticket_no;
    let query;
    if (vlookup.visitorNo) {
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

    if (vlookup.visitorNo) {
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
  const payload = {wasSuccess: true};
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

  return wasSuccess
}

module.exports = {
  test,
  addUser,
  loginUser,
  addTicketAndVisitor,
  getTicketInfo,
  addResortReservation,
  loadRestaurantNames,
  addRestaurantReservation,
  getResortReservation,
  getRestaurantReservation,
  removeReservation,
  removeTicket,
  updateRestaurantReservation,
  updateResortReservation,
  updateProfile,
  updatePassword,
  getProfile,
  findExistingVisitor,
  updateVisitor
};

