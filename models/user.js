//Models a user in the system
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    config = require('../config/database'),
    Credentials = require('../models/credentials');

//User schema for mongo
const UserSchema = mongoose.Schema({
    name: {
        type: String
    },

    email: {
        type: String,
        required: true
    }, 

    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    credentials: [Credentials]

});

//Export a user model to be used by app
const User = module.exports = mongoose.model('User', UserSchema);
//Allows user to be searched by ID from the outside
module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}
//Allows user to be searched by username from the outside
module.exports.getUserByUsername = function(username, callback) {
    const query = { username: username }
        User.findOne(query, callback);
}
//Adds user and encrypts password using bcrypt library
module.exports.addUser = function(newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}
//Compare password with hashed password
module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}