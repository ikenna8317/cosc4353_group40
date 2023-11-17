var sql = require('mssql');
var dbConfig = require('./db-config.js');


async function getProfileInfo() {
    try {
      await sql.connect(dbConfig);
      var query = `SELECT v.first_name, v.last_name, v.ticket_no, t.t_type FROM novapark.visitor v INNER JOIN novapark.ticket t ON v.ticket_no = t.ticket_no WHERE v.ticket_no = ${user.ticket.number}`
      const ticketInfo = await sql.query('SELECT * FROM your_table');
      console.log(ticketInfo);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      sql.close();
    }
  }