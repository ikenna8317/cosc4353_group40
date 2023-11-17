require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var db = require('./db.js')

const APP_STATES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_RESET: 'password_reset',
  EDIT_PROFILE : 'edit_profile'
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      secure: false, // set this to true on production
  }
}


var app = express();
//replace root with server root in production
var root = process.env.ROOT_PATH

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session(sessionConfig))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// csecret1
// ~0e8Q~sICd_PmPvUFQ~P8h7hmClEZI4IQh5kSbP2

app.get('/', function(req, res, next) {
  res.sendFile('./public/carousel.html', {root})
  // res.render('login-demo', {isLoggedIn: false, user: {name: '<anon>'}});
});


// router.get('/signin', function(req, res, next) {
//   res.sendFile('./public/connect.html', {root});
// });

//change password endpoint
// app.get('/change-passwd',(req, res)=>{
//   getAuthCode(process.env.RESET_PASSWORD_POLICY_AUTHORITY, [], APP_STATES.PASSWORD_RESET, res); 
// });

//login endpoint
app.get('/login', function(req, res, next) {
  if (req.session.user && req.session.user.isLoggedIn) {
    res.redirect('/profile')
  } else {
    res.sendFile('./public/connect.html', {root});
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
        email,
        fname: status.user.fname,
        lname: status.user.lname,
        privilege: status.user.privilege
      }
      res.redirect('/profile')
    } else {
      // console.log('app.js login fail!')
      res.redirect('/login')
    }
})

app.post('/signup', async function(req, res, next) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var password = req.body.password;

  //might do validation later
  await db.addUser(fname, lname, email, password)

  req.session.user = {
    isLoggedIn: true,
    email,
    fname,
    lname,
    privilege: 0
  }

  res.redirect('/profile')
});
//profile edit endpoint
// app.get('/profile-edit',(req, res)=>{
//   getAuthCode(process.env.EDIT_PROFILE_POLICY_AUTHORITY, [], APP_STATES.EDIT_PROFILE, res); 
// });

app.get('/logout', async function(req, res, next) {
  req.session.destroy(() => {
      //When session destruction succeeds, notify B2C service using the logout uri.
      res.redirect('/');
  });
});

app.get('/redirect',(req, res)=>{
    
    //determine the reason why the request was sent by checking the state
    if (req.query.state === APP_STATES.LOGIN) {
        //prepare the request for authentication        
        tokenRequest.code = req.query.code;
        confidentialClientApplication.acquireTokenByCode(tokenRequest).then((response)=>{
        
        req.session.sessionParams = {user: response.account, idToken: response.idToken};
        console.log("\nAuthToken: \n" + JSON.stringify(response));

        //render the profile page and replace this line below
        req.session.user = {
          isLoggedIn: true,
           name: response.account.idTokenClaims.given_name,
           fname: '',
           lname: '',
           email: response.account.idTokenClaims.emails[0],
           resort_reservation: {hasReservation: false, details: {
              suiteType: '',
              roomNo: '',
              durationInHours: 0
           }},
           restaurant_reservation: {hasReservation: false, details: {}},
           ticket: {isValid: false, number: ''}
        }
        res.redirect('/profile')
        // res.render('phome', {email: req.session.user.email});


        }).catch((error)=>{
            console.log("\nErrorAtLogin: \n" + error);
        });
    }else if (req.query.state === APP_STATES.PASSWORD_RESET) {
        //If the query string has a error param
        if (req.query.error) {
            //and if the error_description contains AADB2C90091 error code
            //Means user selected the Cancel button on the password reset experience 
            if (JSON.stringify(req.query.error_description).includes('AADB2C90091')) {
                //Send the user home with some message
                //But always check if your session still exists
                // res.render('signin', {showSignInButton: false, givenName: req.session.sessionParams.user.idTokenClaims.given_name, message: 'User has cancelled the operation'});
                res.redirect('/profile')
                // res.render('/',{isLoggedIn: true, user: {name: req.session.sessionParams.user.idTokenClaims.given_name}});
            }
        }else{
          res.redirect('/profile');
        }        
        
    }else if (req.query.state === APP_STATES.EDIT_PROFILE){
    
        tokenRequest.scopes = [];
        tokenRequest.code = req.query.code;
        
        //Request token with claims, including the name that was updated.
        confidentialClientApplication.acquireTokenByCode(tokenRequest).then((response)=>{
            // req.session.sessionParams = {user: response.account, idToken: response.idToken};
            req.session.user.email = response.account.idTokenClaims.emails[0];
            console.log("AuthToken: \n" + JSON.stringify(response));
            // res.render('phome',{isLoggedIn: true, user: {name: response.account.idTokenClaims.given_name}});
            res.redirect('/profile')
            
        }).catch((error)=>{
            //Handle error
        });
    }else{
        res.status(500).send('We do not recognize this response!');
    }

});

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

app.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('phome', {email: req.session.user.email});
});

app.get('/profile-buy-ticket', isLoggedIn, function(req, res, next) {
  res.render('buy-ticket', {
      email: req.session.user.email,
      fname: req.session.user.fname,
      lname: req.session.user.lname
    });
});

app.get('/profile-paywall', isLoggedIn, function(req, res, next) {
  res.render('profile-paywall', {email: req.session.user.email});
});

app.get('/book-resort-reservation', isLoggedIn, function(req, res, next) {
  res.render('book-resort-res', {email: req.session.user.email});
});

app.get('/manage-resort-reservation', isLoggedIn, function(req, res, next) {
  res.render('manage-resort-res', {email: req.session.user.email});
});

// /manage-restaurant-reservation
app.get('/manage-restaurant-reservation', isLoggedIn, function(req, res, next) {
  res.render('manage-restaurant-res');
});

app.get('/refund-ticket', isLoggedIn, function(req, res, next) {
  res.render('refund-ticket', {email: req.session.user.email});
});

// app.listen(process.env.SERVER_PORT, () => {
//   console.log(`Msal Node Auth Code Sample app listening on port !` + process.env.SERVER_PORT);
// });

module.exports = app;
