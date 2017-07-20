const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser')
var application = express();

application.engine('mustache', mustache());

application.set('views', './views');
application.set('view engine', 'mustache');

var storage = {
    users: [{ name: '', password: '' }],
    sessionId: 0,
    sessions: []
};
application.use(cookieParser());
application.use(bodyParser.urlencoded());
application.use(express.static("public"));

application.use((request, response, next) => {
    if (request.cookies.session !== undefined) {
        var sessionId = parseInt(request.cookies.session);
        var user = storage.sessions[sessionId];

        if (!user) {
            response.locals.user = { isAuthenticated: false };
        }
        else {
            response.locals.user = { isAuthenticated: true };
        }
    } else {
        response.locals.user = { isAuthenticated: false };
    }

    next();
});

application.get('/', (request, response) => {
    response.render('index');
});
application.get('/register', (request, response) => {
    response.render('register');
});
application.post('/register', (request, response) => {


    var user = {
        name: request.body.name,
        password: request.body.password
    }

    storage.users.push(user);
    response.redirect('/signin');
});
application.get('/signin', (request, response) => {
    response.render('signin');
});
application.post('/signin', (request, response) => {
    var name = request.body.name;
    var password = request.body.password;

    var user = storage.users.find(user => { return user.name === name && user.password === password })
    console.log(user);
    if (!user) {
        response.render('signin');
    } else {
        var sessionId = storage.sessionId;
        storage.sessions.push(user);


        response.cookie('session', sessionId);
        storage.sessionId++;
        response.render('welcome',  user);
    }
});

application.get('/welcome', (request, response) => {
    if (response.locals.user.isAuthenticated) {
        response.render('./welcome');
    } else {
        response.redirect('register');
    }
});


application.listen(3000, function () {
    console.log("Its Working!")
});