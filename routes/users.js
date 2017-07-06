//Users Routes file
const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    config = require('../config/database'),
    aesjs = require('aes-js'),
    Credentials = require('../models/credentials'),
    User = require('../models/user');

//Register endpoint for API
router.post('/register', (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });
    //Add a user
    User.addUser(newUser, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to register user.'})
        } else {
            res.json({ success: true, msg: newUser.username + ' registered.' })
        }

    });

});

//Dashboard endpoint for API
router.put('/dashboard', (req, res, next) => {
    //Sends along credentials
    let newCredentials = new Credentials({
        _creator: req.body._creator,
        account: req.body.account,
        username: req.body.username,
        password: req.body.password
    });

    Credentials.addCredentials(newCredentials, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to store credentials.'})
        } else {
            res.json({ success: true, msg: 'Stored credentials for ' + newCredentials.account + '.'})    
        }
        
    });

});

//Delete credentials
router.delete('/:userId/profile/:entryId', (req, res, next) => {
    const userId = req.params.userId;
    const entryId = req.params.entryId;
        console.log('UserID from router request: ' + userId);
        console.log('EntryID from router request: ' + entryId);

    Credentials.deleteCredentials(userId, entryId, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to locate item.'})
        } else {
            res.json({ success: true, msg: 'Deleted credentials.'})
        }
    });
});
//Update credentials
router.put('/profile', (req, res, next) => {
    const updatedCredentials = {
        _creator: req.body._creator,
        account: req.body.account,
        username: req.body.username,
        password: req.body.password,
        _id: req.body._id
    };

    Credentials.updateCredentials(updatedCredentials, (err) => {
        console.log('Entry received in users.js: ' + updatedCredentials.account + ', ' + updatedCredentials.username + ', ' + updatedCredentials.password);
            if (err) {
                res.json({ success: false, msg: 'Failed to locate item.'})
            } else {
                res.json({ success: true, msg: 'Updated credentials.'})
            }
    });
});

//Authentication endpoint for API
router.post('/authenticate', (req, res, next) => {
    //Get user that is being authenticated
    const username = req.body.username,
        password = req.body.password;

    //Look for user by username
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json( { success: false, msg: 'User not found.' });
        } 
        //If found, compare password to hashed password in database
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            //If matched, create token
            if (isMatch) {
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 //1 week in seconds
                });
                //Send success message from backend to frontend
                res.json({ success: true, 
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else {
                return res.json({ success: false, msg: 'Wrong password.' });
            }
        });
    });
});

//Profile endpoint for API
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({ user: req.user });

});

//Export module as router
module.exports = router;