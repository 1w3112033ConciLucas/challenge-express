var express = require("express");
var server = express();
var bodyParser = require("body-parser");


var model = {
    clients: {},
    reset: () => {
        model.clients = {};
    },

    addAppointment: (name, appoint) => {
        if( !model.clients[name] ) {
            model.clients[name] = [];
        }

        let appointment = {
            date: appoint.date,
            status: 'pending'
        }
        
        model.clients[name].push(appointment)
        return appointment
    },

    attend: (name, date) => {
        let appoint = model.clients[name].find(appoint => appoint.date === date);

        appoint.status = 'attended';
        return appoint;
    },

    expire: (name, date) => {
        let appointment = model.clients[name].find(appoint => appoint.date === date);

        appointment.status = 'expired';
        return appointment;
    },

    cancel: (name, date) => {
        let appointment = model.clients[name].find(appoint => appoint.date === date);

        appointment.status = 'cancelled';
        return appointment;
    },

    erase: (name, data) => {
        if (data === 'pending' || data === 'cancelled' || data === 'expired' || data === 'attended') {
            let removed = model.clients[name].filter(appoint => appoint.status === data)
            let newArray = model.clients[name].filter(appoint => appoint.status !== data)
            model.clients[name] = newArray;
            return removed;
        } else {
            model.clients[name] = model.clients[name].filter(appoint => appoint.date !== data);
            return {name, data};
        }
    },

    getAppointments: (name, status) => {

        if (status) {
            return model.clients[name].filter(appoint => appoint.status === status)
        }

        return model.clients[name]
    },

    getClients: () => {
        return Object.keys(model.clients)
    }


};

server.use(bodyParser.json());

server.get('/api', (req, res) => res.json(model.clients));

server.post('/api/Appointments', (req, res) => {

    let {appointment, client} = req.body

    if (!client) {
        res.status(400).send('the body must have a client property');
    } else if ( typeof client !== 'string') {
        res.status(400).send('client must be a string');
    } else {
        res.json(model.addAppointment(client, appointment))
    }
})

server.get('/api/Appointments/clients', (req, res) => {
    res.send(model.getClients())
})

server.get('/api/Appointments/:name', (req, res) => {
    let {name} = req.params;
    
    let {date, option} = req.query;

    if (model.getAppointments(name)) {

        let clientAppointment = model.getAppointments(name);
        
        if (!clientAppointment.find(appoint => appoint.date === date)) {
            return res.status(400).send('the client does not have a appointment for that date')
        }
        if (option !== 'expire' && option !== 'attend' && option !== 'cancel') {
            res.status(400).send('the option must be attend, expire or cancel')
        } else {
            res.send( model[option](name, date) );
        }

    } else {

        return res.status(400).send('the client does not exist')
    }
})

server.get('/api/Appointments/:name/erase', (req, res) => {
    let {name} = req.params;
    let {date} = req.query;

    if (model.getAppointments(name)) {
        res.json(model.erase(name, date))
    } else {
        return res.status(400).send('the client does not exist')
    }
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {

    let {name} = req.params;
    let {status} = req.query;

    res.send(model.getAppointments(name, status))
})

server.listen(3000);
module.exports = { model, server };