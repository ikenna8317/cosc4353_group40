const volunteer = require('express').Router();

// const volunteerViewPath = 'volunteer/';

volunteer.get('/', function(req, res) {
  res.render('volunteer/home.pug')
})
  
module.exports = volunteer;