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


app.post('/signup', async function(req, res, next) {
  const { fname, lname, email, password} = req.body;

  //might do validation later
  const userNo = await db.addUser(fname, lname, email, password);
  
  console.log(userNo);
  if (userNo != -1) {
    req.session.user = {
      isLoggedIn: true,
      userNo,
      fname,
      lname,
      email,
      alertMsg: '',
      alertType: 'success',
      privilege: 0,
      postData: {hasData: false}
    }
    console.log('User: ', req.session.user);

    req.session.save(function(err) {
        res.redirect('/profile/');
      });
  } else {
    console.error("Error signing up user\n");
    res.status(500).send('Database lookup error');
  }
});

app.get('/logout', async function(req, res, next) {
  req.session.destroy(() =>   res.redirect('/'));
});

// app.listen(port, () => {
//   console.log(`site at http://localhost:${port}`)
// });

module.exports = app;
