const user = require('express').Router();
const db = require('../db');
const {PayPostType} = require('../constants.js');

// /
// /book-resort
// /book-restaurant
// /buy-ticket
// /book-resort
// /paywall
// /pay-success
// /book-resort
// /manage-resort-reservation
// /refund-ticket
user.get('/test', async function(req, res, next) {

    let ticket = await db.getTicketInfo(req.session.user.userNo);

    if (ticket.wasSuccess) {
        ticket = {fname: req.session.user.fname, lname: req.session.user.lname, ticketNum: ticket.ticketNum, ticketType: ticket.ticketType};
        res.send(ticket);
    }
    else {
        ticket = {};
        res.send('Truly no ticket!\n');
    }

  });

user.get('/', async function(req, res, next) {

    let ticket = await db.getTicketInfo(req.session.user.userNo);
    let resort = await db.getResortReservation(ticket.ticketNum);
    let restaurant = await db.getRestaurantReservation(ticket.ticketNum);
    let tdata = null;

    if (ticket.wasSuccess)
        tdata = {'First name': ticket.fname, 'Last name': ticket.lname, 'Ticket number': ticket.ticketNum, 'Ticket type': ticket.ticketType};
    else
        tdata = {};

    if (resort.wasSuccess)
        resort = {'First name': ticket.fname, 'Last name': ticket.lname, 'Book date': resort.bookDate, 'Suite type': resort.suiteType, 'Stay (in hours)': resort.stayInHours};
    else
        resort = {};

    if (restaurant.wasSuccess)
        restaurant = {'First name': ticket.fname, 'Last name': ticket.lname, 'Book date': restaurant.bookDate, 'Num of seats': restaurant.numOfPeople, 'Restaurant name': restaurant.restaurantName};
    else
        restaurant = {};

    const alertMsg = req.session.user.alertMsg;
    req.session.user.alertMsg = '';
    res.render('profile/phome', {email: req.session.user.email, data: [tdata, resort, restaurant], alertMsg, alertType: req.session.user.alertType});
    
  });
  
user.get('/buy-ticket', doesNotHaveTicket, async function(req, res, next) {
    // const ticket = await db.getTicketInfo(req.session.user.userNo);
//{visitorNo, wasSuccess}

    const {visitorNo, wasSuccess} = await db.findExistingVisitor(req.session.user.userNo);

    if (!wasSuccess) {
      req.session.user.alertMsg = 'Unable to lookup your visitor registration. Try again later';
      req.session.user.alertType = 'danger';
      return res.redirect('/profile/');
    }

    res.render('profile/buy-ticket', {
        email: req.session.user.email,
        fname: req.session.user.fname,
        lname: req.session.user.lname,
        visitorNo,
        haveTicket: false
    });
});

user.post('/buy-ticket', doesNotHaveTicket, function(req, res, next) {
    const fname = req.body.fname ? req.body.fname : req.session.user.fname;
    const lname = req.body.lname ? req.body.lname : req.session.user.lname;
  
    req.session.user.postData.hasData = true;
    req.session.user.postData.type = PayPostType.TICKET;
    req.session.user.postData.ticketInfo = {fname, lname, phone: req.body.phone, age: req.body.age, ticketOption: req.body.ticket_choice, userNo: req.session.user.userNo};
    res.redirect('/profile/paywall');
  });
  
user.get('/paywall', hasPostData, function(req, res, next) {
res.render('profile/profile-paywall', {email: req.session.user.email});
});

user.post('/pay-success', hasPostData, async function(req, res, next) {
    //submit the ticket and visitor data into the db
    let msg;
    let alertType = "success";
    if (req.session.user.postData.type === PayPostType.TICKET) {
      if (await db.addTicketAndVisitor(req.session.user.postData.ticketInfo)) {
        msg = "Successfully purchased ticket";
      } else {
        msg = "Could not complete ticket purchase. Try again later!";
        alertType = "danger";
      }
    } else if (req.session.user.postData.type === PayPostType.RESORT) {
        const ticketNo = (await db.getTicketInfo(req.session.user.userNo)).ticketNum;
        const response = (await db.addResortReservation(req.session.user.postData.resort, ticketNo));
      if (response.wasSuccessful) {
        msg = "Successfully added a resort reservation";
      } else {
        // msg = "Could not book the resort reservation";
        if (response.errMsg)
            msg = response.errMsg;
        else
            msg = "Could not book the resort reservation";
        alertType = "danger";
      }
    }
  
    req.session.user.alertMsg = msg;
    req.session.user.alertType = alertType;
    res.redirect('/profile/');
  })
  

user.get('/book-resort', mustHaveTicket, async function(req, res) {
    const {bookDate, suiteType, stayInHours, wasSuccess} = await db.getResortReservation(req.ticketInfo.ticketNum);
    let editMode = wasSuccess;
    
    res.render('profile/book-resort-res', {email: req.session.user.email, bookDate, suiteType, stayInHours, editMode});    
});

user.post('/book-resort', mustHaveTicket, function(req, res, next) {
    req.session.user.postData.hasData = true;
    req.session.user.postData.type = PayPostType.RESORT;
    req.session.user.postData.resort = {
      bookDate: req.body.book_date,
      suiteChoice: req.body.suite_choice,
      hoursChoice: req.body.hours_choice
    }
    res.redirect('/profile/paywall');
  });
  

user.get('/manage-resort-reservation', async function(req, res, next) {
    const ticketInfo = (await db.getTicketInfo(req.session.user.userNo));
    if (!ticketInfo.wasSuccess)
        res.render('profile/manage-resort-res', {email: req.session.user.email});
    else {
        const reservation = await db.getResortReservation(ticketInfo.ticketNum);
        // res.send(reservation);
        if (reservation.wasSuccess)
            res.render('profile/manage-resort-res', {email: req.session.user.email, reservation, fname: ticketInfo.fname, lname: ticketInfo.lname, tnumber: ticketInfo.ticketNum});
        else
            res.render('profile/manage-resort-res', {email: req.session.user.email});
            
    } 
  });

user.get('/book-restaurant', mustHaveTicket, async function(req, res, next){
    const { bookDate, numOfPeople, restaurantName, wasSuccess } = await db.getRestaurantReservation(req.ticketInfo.ticketNum);
    let editMode = false;
    if (wasSuccess)
      editMode = true;
    const restaurants = await db.loadRestaurantNames();
    if (restaurants.wasSuccess)
        res.render('profile/book-restaurant-res', {email: req.session.user.email, restaurants: restaurants.restaurantList, editMode, bookDate, numOfPeople, restaurantName});
    else
        res.render('profile/book-restaurant-res', {email: req.session.user.email});

  });
user.post('/book-restaurant', mustHaveTicket, async function(req, res, next){
  const bookDate = req.body.book_date;
  const restaurantChoice = req.body.restaurant_choice;
  const numOfSeats = req.body.num_seats;
  const ticketNo = req.ticketInfo.ticketNum;
  // const ticketNo = (await db.getTicketInfo(req.session.user.userNo)).ticketNum;


  //enter data into the database
  //{ bookDate, restaurantChoice, numOfSeats }
  // let msg;
  let alertType;
  const response = await db.addRestaurantReservation({bookDate, restaurantChoice, numOfSeats}, ticketNo);

  if (response.wasSuccessful) {
    req.session.user.alertMsg = "Successfully added a restaurant reservation";
    alertType = "success";
  } else {
    req.session.user.alertMsg = response.errMsg;
    alertType = "danger";
  }

  req.session.user.alertType = alertType;
  res.redirect('/profile/');
});

user.post('/edit-restaurant', mustHaveTicket, async function(req, res) {
  const ticketNo = req.ticketInfo.ticketNum;
  const { book_date, restaurant_choice, num_seats } = req.body;

  const {wasSuccess, errMsg} = await db.updateRestaurantReservation(ticketNo, {book_date, restaurant_choice, num_seats});
  if (wasSuccess) {
    req.session.user.alertMsg = 'Successfully updated restaurant reservation';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = 'Could not update restaurant reservation';
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   

});

user.post('/edit-resort', mustHaveTicket, async function(req, res) {
  const ticketNo = req.ticketInfo.ticketNum;
  const { book_date, suite_choice, hours_choice } = req.body;

  const {wasSuccess} = await db.updateResortReservation(ticketNo, {book_date, suite_choice, hours_choice});
  if (wasSuccess) {
    req.session.user.alertMsg = 'Successfully updated restaurant reservation';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = 'Could not update restaurant reservation';
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   
});
  

user.get('/manage-restaurant-reservation', async function(req, res, next) {
    const ticketInfo = (await db.getTicketInfo(req.session.user.userNo));
    if (!ticketInfo.wasSuccess)
        res.render('profile/manage-restaurant-res', {email: req.session.user.email, reservation: {}});
    else {
        const reservation = await db.getRestaurantReservation(ticketInfo.ticketNum);
        if (reservation.wasSuccess)
            res.render('profile/manage-restaurant-res', {email: req.session.user.email, reservation, fname: ticketInfo.fname, lname: ticketInfo.lname, tnumber: ticketInfo.ticketNum});
        else
            res.render('profile/manage-restaurant-res', {email: req.session.user.email});

    } 
  });

user.get('/edit-profile', async function(req, res) {
  const {email, fname, lname, wasSuccess, errMsg} = await db.getProfile(req.session.user.userNo);

  if (wasSuccess) 
    return res.render('profile/edit-profile', {email, fname, lname});
  
  req.session.user.alertMsg = errMsg;
  req.session.user.alertType = 'danger';
  res.redirect('/profile/');
});
user.post('/edit-profile', async function(req, res) {
  let { email, fname, lname } = req.body;

  if (!email && !fname && !lname) {
    req.session.user.alertMsg = 'You made no edit to your profile';
    req.session.user.alertType = 'danger';
    return res.redirect('/profile/');   
  } 

  const userInfo = await db.getProfile(req.session.user.userNo);

  //{email, fname, lname}
  email ? email : req.session.user.email;
  fname ? fname : userInfo.fname;
  lname ? lname : userInfo.lname;

  const { wasSuccess, errMsg } = await db.updateProfile(req.session.user.userNo, {email, fname, lname});
  req.session.user.email = email;

  if (wasSuccess) {
    req.session.user.alertMsg = 'Your email changed to ' + email;
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = errMsg;
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   
  
});

user.route('/edit-visitor')
.get(async function(req, res) {
  const {visitorNo, fname, lname, ticketNo, phone, age, wasSuccess} = await db.findExistingVisitor(req.session.user.userNo);

  if (!wasSuccess) {
    req.session.user.alertMsg = 'Unable to verify visitor status! Try again';
    req.session.user.alertType = 'danger';
    return res.redirect('/profile/');
  }

  res.render('profile/edit-visitor', {visitorInfo: {'visitor no': visitorNo, 'first name': fname, 'last name': lname, 'ticket number': ticketNo, 'phone': phone, 'age': age}, visitorNo});
})
.post(async function(req, res) {
  const {fname, lname, phone, age} = req.body;
  const wasSuccess = await db.updateVisitor(req.session.user.userNo, {fname, lname, phone, age});
//updateVisitor(userNo, info)
  if (wasSuccess) {
    req.session.user.alertMsg = 'Successfully updated visitor information';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = 'Unable to modify visitor information';
    req.session.user.alertType = 'danger';
  }

  res.redirect('/profile/');
});

user.get('/reset-password', async function(req, res) {
  res.render('profile/reset-password');
});
user.post('/reset-password', async function(req, res) {
  const { wasSuccess, errMsg } = await db.updatePassword(req.session.user.userNo, req.body.new_password, req.body.curr_password);

  if (wasSuccess) {
    req.session.user.alertMsg = 'Password successfully updated!';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = errMsg;
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   
  
});

  // removeReservation(ticketNo, isResort)
user.post('/remove-resort-reservation', mustHaveTicket, async function(req, res) {
  // const ticketInfo = await db.getTicketInfo(req.session.user.userNo);

  const errMsg = await db.removeReservation(req.ticketInfo.ticketNum, true);

  if (!errMsg) {
    req.session.user.alertMsg = 'Successfully removed your reservation! No refunds lol ;)';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = errMsg;
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   
});
user.post('/remove-restaurant-reservation', mustHaveTicket, async function(req, res) {
  // const ticketInfo = await db.getTicketInfo(req.session.user.userNo);

  const errMsg = await db.removeReservation(req.ticketInfo.ticketNum, false);

  if (!errMsg) {
    req.session.user.alertMsg = 'Successfully removed your reservation!';
    req.session.user.alertType = 'success';
  } else {
    req.session.user.alertMsg = errMsg;
    req.session.user.alertType = 'danger';
  }
  res.redirect('/profile/');   
});
  
user.get('/refund-ticket', async function(req, res, next) {
    const ticketInfo = await db.getTicketInfo(req.session.user.userNo);
    if (ticketInfo.wasSuccess) {
        res.render('profile/refund-ticket', {
            email: req.session.user.email,
            fname: ticketInfo.fname,
            lname: ticketInfo.lname,
            tnum: ticketInfo.ticketNum,
            ttype: ticketInfo.ticketType});
    }
    else
        res.render('profile/refund-ticket', {email: req.session.user.email});
});

// removeTicket(ticketNo, userNo)
user.post('/refund-ticket', mustHaveTicket, async function(req, res) {
    // const ticketInfo = await db.getTicketInfo(req.session.user.userNo);
    const errMsg = await db.removeTicket(req.ticketInfo.ticketNum, req.session.user.userNo);

    req.session.user.alertMsg = errMsg;
    req.session.user.alertType = 'danger';
    res.redirect('/profile/');     
});

  //middlewares

  //use this to stop the user from trying to buy another ticket when they already have one
async function doesNotHaveTicket(req, res, next) {
    const ticketInfo = (await db.getTicketInfo(req.session.user.userNo));

    if (!ticketInfo.wasSuccess)
        next();
    else {
        req.session.user.alertMsg = 'You already have a ticket!';
        req.session.user.alertType = 'danger';
        res.redirect('/profile/');
    }     
}

// {ticketNum: '', ticketType: '', wasSuccess: true};
async function mustHaveTicket(req, res, next) {
    const ticketInfo = (await db.getTicketInfo(req.session.user.userNo));

    if (ticketInfo.wasSuccess) {
        req.ticketInfo = { fname: ticketInfo.fname, lname: ticketInfo.lname, ticketNum: ticketInfo.ticketNum, ticketType: ticketInfo.ticketType };
        next();
    }
    else {
        req.session.user.alertMsg = 'You need a ticket to use this resource';
        req.session.user.alertType = 'danger';
        res.redirect('/profile/');
    }     
}

function hasPostData(req, res, next) {
    if (req.session.user.postData.hasData)
      next();
    else {
      req.session.user.alertMsg = 'You need to select an item you want to purchase';
      req.session.user.alertType = 'danger';
      res.redirect('/profile');
    }
  }


  
module.exports = user;