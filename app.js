require('dotenv').config();
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require('./db.js');
const crypto = require('crypto');
const { UserRedirects } = require('./constants.js');


const isProduction = process.env.NODE_ENV === 'production';


// const port = process.env.PORT || 3000


function generateRandomSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

//routers
const volunteer = require('./routes/volunteer');

console.log('Environment:', isProduction);
const app = express();

const root = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const secret = generateRandomSecret(8);

const sessionConfig = {
  secret, // Use the randomly generated secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction// set this to true on production
  }
}

app.use(session(sessionConfig));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// {fallthrough: isProduction, index: false}
app.use(express.static(path.join(__dirname, 'public')));

app.use('/volunteer', volunteer);


app.get('/', function(req, res, next) {
  res.render('profile/phome');
});

app.get('/test', function(req, res, next) {
  // res.sendFile('./public/pricing.html', {root})
});

//login endpoint
app.get('/login', function(req, res, next) {
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).send('Error: ' + err.message);
});


app.get('/logout', async function(req, res, next) {
  req.session.destroy(() =>   res.redirect('/'));
});

// app.listen(port, () => {
//   console.log(`site at http://localhost:${port}`)
// });

module.exports = app;
