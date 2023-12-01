require('dotenv').config();
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require('./db.js');
const crypto = require('crypto');
const { UserRedirects } = require('./constants.js');
const isProduction = require('./nodeenv');

// const port = process.env.PORT || 3000


function generateRandomSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

//routers
const user = require('./routes/user');
const pos = require('./routes/pos');
const mgr = require('./routes/mgr');

console.log('Environment:', isProduction);
const app = express();

const root = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// const randomSecret = generateRandomSecret(8);

const sessionConfig = {
  secret: 'session123', // Use the randomly generated secret key
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

app.use('/profile', isUser);
app.use('/profile', user);

app.use('/pos', isPointOfSales);
app.use('/mgr', isManager);

app.use('/pos', pos);
app.use('/mgr', mgr);


app.get('/', function(req, res, next) {
  res.sendFile('./public/carousel.html', {root})
});

app.get('/test', function(req, res, next) {
  res.sendFile('./public/pricing.html', {root})
});

app.get('/events', async function(req, res, next) {
  const { wasSuccess, payload } = await db.getEvents(false, true);
  if (!wasSuccess)
      console.error('Unable to retrieve events!');

  res.render('home/home-events', {events: payload});
});

//login endpoint
app.get('/login', function(req, res, next) {
  if (req.session.user && req.session.user.isLoggedIn) {
    res.redirect('/profile/')
  } else {
    res.sendFile('./public/connect.html', {root: __dirname});
  }
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).send('Error: ' + err.message);
});

app.post('/login', async function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    const { loggedIn, userNo, privilege, fname, lname } = await db.loginUser(email, password);

    if (loggedIn) {
      // console.log('app.js login success!')
      req.session.user = {
        isLoggedIn: true,
        userNo,
        privilege,
        email,
        fname,
        lname,
        alertMsg: '',
        alertType: 'success',
        postData: { hasData: false },

      }
      req.session.save(function(err) {
        res.redirect('/' + UserRedirects[privilege] + '/');
      });
      console.log('User logged in');
      
    } else {
      // console.log('app.js login fail!')
      res.redirect('/login')
    }
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
  req.session.destroy(() => {
      res.redirect('/');
  });
});



//authenticate as user
function isUser(req, res, next) {
  // console.log(req.session.user);
  if (req.session.user && req.session.user.isLoggedIn && req.session.user.privilege === 0) {
    // console.log('Called isUser middleware');
      next();
  } else {
    // console.log('failed isUser middleware');
    // res.status(500).send('failed user login middeware');
      res.redirect('/login');
  }
}

//authenticate as point of sales
function isPointOfSales(req, res, next) {
  if (req.session.user && req.session.user.isLoggedIn && req.session.user.privilege === 4) {
      next();
  } else {
      res.redirect('/login');
  }
}

//authenticate as senior manager
function isManager(req, res, next) {
  if (req.session.user && req.session.user.isLoggedIn && req.session.user.privilege === 17) {
      next();
  } else {
      res.redirect('/login');
  }
}

// app.listen(port, () => {
//   console.log(`site at http://localhost:${port}`)
// });

module.exports = app;
