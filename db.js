var sql = require('mssql');
const dbc = require('./db-config.js');

var pool = new sql.ConnectionPool(dbc.dbConfig);

async function getTicketInfo() {
    try {
      await pool.connect();
      var query = `SELECT v.first_name, v.last_name, v.ticket_no, t.t_type FROM novapark.visitor v INNER JOIN novapark.ticket t ON v.ticket_no = t.ticket_no WHERE v.ticket_no = ${user.ticket.number}`
      const ticketInfo = await pool.request().query(query);
      console.log("Loaded ticket info");
    } catch (err) {
      console.error('Error:', err);
    } finally {
      pool.close();
    }
}

async function loginUser(email, password) {
    const payload = {
        loggedIn: false,
        user: {
            privilege: -1,
            email: '',
            fname: '',
            lname: ''
        }
    }
    try {
        //SELECT * FROM users WHERE username = 'user1' AND password = 'hashed_password';
        var query = 'SELECT top 1 * FROM novapark.[user] WHERE email = @email AND passkey = @passkey';
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
            console.log('User successfully logged in\n');
        } else {
            console.log('User could not login!\n')
            console.log('Your password: ' + password + '\n')
        }
        
    } catch (err) {
        console.error('Error:', err);
      } finally {
        pool.close();
      }
      return payload;
}

async function addUser(fname, lname, email, password) {
    try {
      await pool.connect();
      const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('passkey', sql.NVarChar, password)
      .input('first_name', sql.NVarChar, fname)
      .input('last_name', sql.NVarChar, lname)
      .query('insert into novapark.[user] (email, passkey, first_name, last_name) values (@email, @passkey, @first_name, @last_name)');

      console.log("User successfully added!\n");
    } catch (err) {
      console.error('Error:', err);
    } finally {
      pool.close();
    }
  }

module.exports.getTicketInfo = getTicketInfo;
module.exports.addUser = addUser;
module.exports.loginUser = loginUser;
