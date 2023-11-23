require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require('./db.js');

//routers
const user = require('./routes/user');


const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // set this to true on production
  }
}


const app = express();
//replace root with server root in production
const root = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session(sessionConfig))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/profile', isLoggedIn);
app.use('/profile', user);

// csecret1
// ~0e8Q~sICd_PmPvUFQ~P8h7hmClEZI4IQh5kSbP2

app.get('/', function(req, res, next) {
  res.sendFile('./public/carousel.html', {root})
  // res.render('login-demo', {isLoggedIn: false, user: {name: '<anon>'}});
});

app.get('/events', function(req, res, next) {
  res.render('home/home-events')
});

//login endpoint
app.get('/login', function(req, res, next) {
  if (req.session.user && req.session.user.isLoggedIn) {
    res.redirect('/profile/')
  } else {
    res.sendFile('./public/connect.html', {root: __dirname});
  }
});

app.post('/login', async function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    const status = await db.loginUser(email, password);

    if (status.loggedIn) {
      // console.log('app.js login success!')
      req.session.user = {
        isLoggedIn: true,
        userNo: status.user.userNo,
        privilege: status.user.privilege,
        email,
        fname: status.user.fname,
        lname: status.user.lname,
        alertMsg: '',
        alertType: 'success',
        postData: { hasData: false },

      }
      console.log('Your user_no is', req.session.user.userNo);
      res.redirect('/profile/');
    } else {
      // console.log('app.js login fail!')
      res.redirect('/login')
    }
})

app.post('/signup', async function(req, res, next) {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const password = req.body.password;

  //might do validation later
  const userNo = await db.addUser(fname, lname, email, password);
  
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
    res.redirect('/profile/');
  } else {
    //send a custom message to the user later on
    console.error("Error signing up user\n");
  }
});

app.get('/logout', async function(req, res, next) {
  req.session.destroy(() => {
      res.redirect('/');
  });
});


//middlewares

function isLoggedIn(req, res, next) {
  // Check authentication logic (e.g., checking session, tokens, etc.)
  if (req.session.user && req.session.user.isLoggedIn) {
      // User is authenticated, proceed to the next middleware or route handler
      next();
  } else {
      // User is not authenticated, redirect to login page or display an error
      res.redirect('/login'); // Redirect to the main page
  }
}

module.exports = app;
