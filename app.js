//import
const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    users = require('./routes/users'),
    config = require('./config/database');

//Connect to Mongo
mongoose.connect(config.database);
//Verify connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database: ' + config.database);
})
//If error
mongoose.connection.on('error', (err) => {
    console.log(err + ': error in : ' + config.database);
})
//initialize app var with express
const app = express();
const port = 3000;
    //CORS middleware
    app.use(cors());
    //Set static folder 
    app.use(express.static(path.join(__dirname, 'public')));
    //BodyParser middleware
    app.use(bodyParser.json());
    //Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
        require('./config/passport')(passport);
    //Handles user files
    app.use('/users', users);
    //Index route
    app.get('/', (req, res) => {
        res.send('Invalid Endpoint.');
    })
    //Sends every route to index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    })
    //Start server
    app.listen(port, () => {
        console.log('Server started on port ' + port + '.');
    })