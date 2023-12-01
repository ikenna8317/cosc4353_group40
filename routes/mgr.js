require('dotenv').config();
const mgr = require('express').Router();
const db = require('../db');

mgr.get('/', function(req, res) {
    res.render('staff-dashb/home', {email: req.session.user.email, role: 'Senior Manager', action: 'mgr'});
});

mgr.get('/actions', async function(req, res) {
    res.render('staff-dashb/mgr-action', {email: req.session.user.email, action: 'mgr'});
});

mgr.route('/add-staff')
.get(async function(req, res) {
    const { wasSuccess, departments } = await db.loadDepartments();

    if (!wasSuccess) 
        console.error('Could not load departments info');

    res.render('staff-dashb/add-staff', {email: req.session.user.email, action: 'mgr', departments});
})
.post(async function(req, res) {
    const wasSuccess = await db.addStaff(req.body);

    if (wasSuccess)
        return res.status(200).send();
    return res.status(500).send();
});

// { name, imgUrl, desc, date }
mgr.route('/add-event')
.get(async function(req, res) {
    res.render('staff-dashb/add-event', {email: req.session.user.email, action: 'mgr'});
})
.post(async function(req, res) {
    const wasSuccess = await db.addEvent(req.body);

    if (wasSuccess)
        return res.status(200).send();
    return res.status(500).send();
});



mgr.route('/manage-staff')
.get(async function(req, res) {
    const loadAll = req.headers['load-all'];

    const staffLoadLimit = loadAll ? false : process.env.ITEM_LOAD_LIMIT ;

    const { wasSuccess: wasSuccess2, payload } = await db.getStaff(staffLoadLimit);
    if (!wasSuccess2) 
        console.error('Could not load staff info');

    if (loadAll) 
        return res.status(200).json(payload);  

    const { wasSuccess, departments } = await db.loadDepartments();
    //put this inside getStaff: process.env.ITEM_LOAD_LIMIT
     
    if (!wasSuccess) 
        console.error('Could not load departments info');

    res.render('staff-dashb/manage-staff', {email: req.session.user.email, action: 'mgr', departments, staffs: payload, numOfStaffLoaded: staffLoadLimit ? staffLoadLimit : 'All'});
})
.post(async function(req, res) {
    console.log(req.body);

    const wasSuccess = await db.updateStaff(req.body);

    if (wasSuccess) {
        const { wasSuccess: wasSuccess2, payload } = await db.getStaff(process.env.ITEM_LOAD_LIMIT);
        if (wasSuccess2)
            return res.status(200).json(payload);
        else
            return res.status(500).send();
    }
    else {
        console.error('There was an error updating staff info!');
        return res.status(500).send();
    }   
})
.delete(async function(req, res) {
    const { staffNo } = req.body;
    // console.log('delete was called for staff ' + staffNo);

    if (await db.removeStaff(staffNo)) {
        // console.log('Successfully deleted staff', staffNo);
        return res.status(200).send();
    }
    
    // console.error('delete failed of staff', staffNo);
    return res.status(500).send();
});


//events
mgr.route('/manage-events')
.get(async function(req, res) {
    const loadAll = req.headers['load-all'];

    const itemLoadLimit = loadAll ? false : process.env.ITEM_LOAD_LIMIT ;

    const { wasSuccess, payload } = await db.getEvents(itemLoadLimit);
    if (!wasSuccess) 
        console.error('Could not load item info');

    if (loadAll) 
        return res.status(200).json(payload);  


    res.render('staff-dashb/manage-events', {email: req.session.user.email, action: 'mgr', events: payload, numOfItemsLoaded: itemLoadLimit ? itemLoadLimit : 'All'});
})
.post(async function(req, res) {
    // console.log(req.body);

    const wasSuccess = await db.updateEvent(req.body);

    if (wasSuccess) {
        const { wasSuccess: wasSuccess2, payload } = await db.getEvents(process.env.ITEM_LOAD_LIMIT);
        if (wasSuccess2)
            return res.status(200).json(payload);
        else
            return res.status(500).send();
    }
    else {
        console.error('There was an error updating event info!');
        return res.status(500).send();
    }   
})
.delete(async function(req, res) {
    const { eventNo } = req.body;
    // console.log('delete was called for staff ' + staffNo);

    if (await db.removeEvent(eventNo)) {
        // console.log('Successfully deleted staff', staffNo);
        return res.status(200).send();
    }
    
    // console.error('delete failed of staff', staffNo);
    return res.status(500).send();
});


mgr.get('/reports', function(req, res) {
    res.render('staff-dashb/mgr-report', {email: req.session.user.email, action: 'mgr'});
});

//reports
mgr.route('/tw-report')
.get(async function(req, res) {
    const { wasSuccess, payload } = await db.getTechnicians();
    // console.log(payload);

    if (!wasSuccess)
        console.error('Could not load technicians');

    res.render('staff-dashb/tw-report', {email: req.session.user.email, action: 'mgr', technicians: payload});
})
.post(async function(req, res) {
    const { wasSuccess, payload } = await db.technicianWorkloadReport(req.body);

    if (!wasSuccess) {
        console.error('Could not load technicians');
        return res.status(500).send();
    }
    return res.status(200).json(payload);
});

module.exports = mgr;