//Models a user in the system
const mongoose = require('mongoose'),
    Schema = mongoose.Schema
    aesjs = require('aes-js'),
    config = require('../config/database'),
    User = require('../models/user');

//Credentials subschema
const credentialsSchema = mongoose.Schema({
    _creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    account: {
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
    }

});

//Exports credentials model
const Credentials = module.exports = mongoose.model('Credentials', credentialsSchema);
//Adds user's credentials and encrypts password
module.exports.addCredentials = function(newCredentials, callback) {
    //256 bit key
    const key_256 = [31, 5, 7, 96, 52, 18, 70, 23, 41, 36, 11, 29, 83, 1, 31, 57,
                     28, 73, 59, 0, 32, 19, 85, 43, 91, 65, 8, 99, 37, 40, 59, 4];
        //plaintext to bytes
        var plaintext = newCredentials.password;
        var textToBytes = aesjs.utils.utf8.toBytes(plaintext);
        //encryption mode
        var aesCTR = new aesjs.ModeOfOperation.ctr(key_256, new aesjs.Counter(20));
        var encryptedBytes = aesCTR.encrypt(textToBytes);
        //convert byte encrypted message to hex for storage
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        //find user and add new credentials to the field
        User.getUserById(newCredentials._creator, (err, user) => {
            newCredentials.password = encryptedHex;
            user.credentials.push(newCredentials);
            user.save(callback);
        });
}
//Allows credentials to be searched by ID from the outside
module.exports.findCredentialsById = function(id, callback) {
    Credentials.findById(id, callback);
}
//Deletes a set of credentials
module.exports.deleteCredentials = function(userId, entryId, callback) {
    User.getUserById(userId, (err, user) => {
        if (err) throw err;
        console.log('Result of query to database: ');
            console.log('ID ' + user._id);
            console.log('Account ' + user.username); 
            console.log('Result of query to subdoc: ');
            for (i in user.credentials) {
                if (user.credentials[i]._id == entryId) {
                    console.log('Object to remove: ');
                    console.log('ID: ' + user.credentials[i]._id);
                    console.log('Account: ' + user.credentials[i].account);
                        user.credentials.pull(user.credentials[i]);
                        user.save(callback);
                }

            }

      });

}
//Updates a set of credentials
module.exports.updateCredentials = function(updatedCredentials, callback) {
    //encrypt incoming updated password
    //256 bit key
    const key_256 = [31, 5, 7, 96, 52, 18, 70, 23, 41, 36, 11, 29, 83, 1, 31, 57,
                     28, 73, 59, 0, 32, 19, 85, 43, 91, 65, 8, 99, 37, 40, 59, 4];
        //plaintext to bytes
        var plaintext = updatedCredentials.password;
        var textToBytes = aesjs.utils.utf8.toBytes(plaintext);
        //encryption mode
        var aesCTR = new aesjs.ModeOfOperation.ctr(key_256, new aesjs.Counter(20));
        var encryptedBytes = aesCTR.encrypt(textToBytes);
        //convert byte encrypted message to hex for storage
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        updatedCredentials.password = encryptedHex;

    console.log('Made it to credentials model');
    User.getUserById(updatedCredentials._creator, (err, user) => {
        if (err) throw err;
        console.log('Result of query to database: ');
            console.log('UserID ' + user._id);
            console.log('Account ' + user.username);

            for (i in user.credentials) {
                if (user.credentials[i]._id == updatedCredentials._id) {
                    console.log('Object to update: ');
                    console.log('ID: ' + user.credentials[i]._id);
                    console.log('Account: ' + user.credentials[i].account);
                    console.log('Updating ' + user.credentials[i].account + ' account...');
                    console.log('New username: ' + updatedCredentials.username);
                    console.log('New Encrypted password: ' + updatedCredentials.password);
                    user.credentials.set(i, updatedCredentials);
                    console.log(user.credentials[i].account + ' account updated!');
                    console.log('Updated fields: ' + user.credentials[i].username + ', ' + user.credentials[i].password);

                }

            }

            console.log('Saving...');
            user.save(callback);
            console.log('Saved!');

    });

}