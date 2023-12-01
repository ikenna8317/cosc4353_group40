const pos = require('express').Router();
const db = require('../db');

pos.get('/', function(req, res) {
    res.render('staff-dashb/home', {email: req.session.user.email});
});


pos.get('/actions', async function(req, res) {
//{wasSuccess, restaurantList}
    const {wasSuccess, restaurantList} = await db.loadRestaurantNames();
    if (!wasSuccess) restaurantList = [];

    res.render('staff-dashb/pos-action', {email: req.session.user.email, restaurants: restaurantList});
});

pos.get('/reports', function(req, res) {
    res.render('staff-dashb/pos-report');
});

pos.route('/rp-report')
.get(loadRideInfo, function(req, res) {
    const rides = req.rides;
    res.render('staff-dashb/rp-report', {email: req.session.user.email, rides});
})
.post(async function(req, res) {
    const { startDate, endDate, ride } = req.body;
    console.log({ startDate, endDate, ride });

    const { wasSuccess, payload } = await db.ridePopularityReport(startDate, endDate, ride);

    if (wasSuccess) 
        return res.status(200).json(payload);
    else {
        console.error('There was an error processing the ride popularity report!');
        return res.status(500).send();
    }   
});


pos.route('/rv-report')
.get(function(req, res) {
    res.render('staff-dashb/rv-report', {email: req.session.user.email});
})
.post(async function(req, res) {
    const { startDate, endDate } = req.body;
    // console.log({ startDate, endDate, ride });

    const { wasSuccess, payload } = await db.revenueReport(startDate, endDate);

    if (wasSuccess) 
        return res.status(200).json(payload);
    else {
        console.error('There was an error generating the report!');
        return res.status(500).send();
    }   
});

pos.route('/ru-report')
.get(loadRideInfo, function(req, res) {
    const rides = req.rides;
    res.render('staff-dashb/ru-report', {email: req.session.user.email, rides});
})
.post(async function(req, res) {
    const { startDate, endDate, rideName } = req.body;
    console.log(req.body);

    const selectAll = (rideName === 'All');
    // console.log({ startDate, endDate, ride });

    const { wasSuccess, payload } = await db.rideUsageReport(startDate, endDate, rideName, selectAll);

    if (wasSuccess) 
        return res.status(200).json(payload);
    else {
        console.error('There was an error processing the ride popularity report!');
        return res.status(500).send();
    }   
});

// /search?q=query&category=books
// const searchTerm = req.query.q;
//   const category = req.query.category;
pos.route('/manage-resort')
.get(async function (req, res) {
    let {wasSuccess, reservations} = await db.getAllResortReservations();
    if (!wasSuccess) reservations = [];

    //{wasSuccess: wasSuccess2, payload}
    const result = await db.getSuiteInfo();
    let suites;
    if (!result.wasSuccess) {
        suites = [];
        console.error('Suite lookup was not successful');
    }
    else
        suites = result.payload

    res.render('staff-dashb/manage-resort', {email: req.session.user.email, reservations, suites});
})
.post(async function (req, res) {
    //input: { ticketNo, book_date, suite_choice, hours_choice }
    const { ticketNo, book_date, suite_choice, hours_choice } = req.body;

    const {wasSuccess, errMsg} = await db.updateResortReservation(ticketNo, {book_date, suite_choice, hours_choice});

    if (wasSuccess) {
        let {wasSuccess: wasSuccess2, reservations} = await db.getAllResortReservations();
        if (wasSuccess2)
           return res.status(200).json(reservations);

        console.error('Unable to load resort reservations');
        return res.status(500).send();
    }
    else {
        console.error('Unable to update reservation');
        res.status(500).send();  
    }

})
.delete(async function (req, res) {
    const { ticketNum } = req.body;

    if (await db.removeReservation(ticketNum, true)) {
        console.error('Unable to remove reservation');
        res.status(500).send();  
    } else
        res.status(204).send();
    // res.redirect(`/pos/manage-resort`);
});

pos.route('/manage-restaurant')
.get(async function (req, res) {
    const restaurantName = req.query.restaurantName;

    let {wasSuccess, reservations} = await db.getAllRestaurantReservations(restaurantName);
    if (!wasSuccess) reservations = [];

    res.render('staff-dashb/manage-restaurant', {email: req.session.user.email, restaurantName, reservations});
})
.post(async function (req, res) {
    //input: { book_date, restaurant_choice, num_seats }
    // const { ticketNo, book_date, restaurant_choice, num_seats } = req.body;
    const { restaurantName, ticketNo, date, numOfSeats } = req.body;
    console.log({ restaurantName, ticketNo, date, numOfSeats });

    const {wasSuccess, errMsg} = await db.updateRestaurantReservation(ticketNo, {book_date: date, restaurant_choice: restaurantName, num_seats: numOfSeats});

    if (wasSuccess) {
        let {wasSuccess: wasSuccess2, reservations} = await db.getAllRestaurantReservations(restaurantName);
        if (wasSuccess2) {
            console.log('Successfully updated and reloaded reservations data');
          return res.status(200).json(reservations);
        }

        console.error('Unable to load reservations for restaurant: ' + restaurantName);
        return res.status(500).send();
    }
    else {
        console.error('Unable to update reservation');
        res.status(500).send();  
    }

})
.delete(async function(req, res) {
    const { restaurantName, ticketNum } = req.body;
    const encodedName = encodeURIComponent(restaurantName);

    if (await db.removeReservation(ticketNum, false)) {
        console.error('Unable to remove reservation');
        res.status(500).send();  
    } else {
        res.status(200).send();  
    }

});


pos.route('/checkin-restaurant')
.get(async function(req, res) {
    const {wasSuccess, restaurantList} = await db.loadRestaurantNames();

    if (!wasSuccess) restaurantList = [];

    res.render('staff-dashb/checkin', {email: req.session.user.email, isRestaurant: true, restaurants: restaurantList});
})
.post(async function(req, res) {
    const {restaurantName, ticketNo} = req.body;

    const {wasSuccess} = await db.getRestaurantReservationFor(ticketNo, restaurantName);
    await db.removeReservation(ticketNo, false);

    const backLink = encodeURIComponent("/pos/checkin-restaurant");

    if (wasSuccess)
        return res.redirect('/pos/checkin-status?s=success&blink='+backLink);
    else
        return res.redirect('/pos/checkin-status?s=fail&blink='+backLink);
});

pos.route('/checkin-resort')
.get(function(req, res) {
    res.render('staff-dashb/checkin', {email: req.session.user.email, isRestaurant: false});
})
.post(async function(req, res) {
    const {ticketNo} = req.body;

    const {wasSuccess} = await db.getResortReservation(ticketNo);
    await db.removeReservation(ticketNo, true);

    const backLink = encodeURIComponent("/pos/checkin-resort");

    if (wasSuccess)
        return res.redirect('/pos/checkin-status?s=success&blink='+backLink);
    else
        return res.redirect('/pos/checkin-status?s=fail&blink='+backLink);
});

pos.get('/checkin-status', function(req, res) {
    const status = (req.query.s === 'success');
    res.render('staff-dashb/checkin-status', {email: req.session.user.email, status, checkinUrl: req.query.blink});
});




//middlewares
//load the ride info
async function loadRideInfo(req, res, next) {
    const {payload} = await db.getRides();

    req.rides = payload;
    next();
}

module.exports = pos;