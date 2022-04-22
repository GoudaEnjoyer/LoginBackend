const express = require('express');
const keys = require('./config/keys.js');

const app = express();

//Setup DB
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI);

//Setup database models
require('./model/account');
const account = mongoose.model('account');

//Routes
app.get('/account', async (req, res) => {

    const { rUsername, rPassword } = req.query;
    if (rUsername == null || rPassword == null) {
        res.send('invalid user/password');
        return;
    }

    var userAccount = await account.findOne({ username: rUsername });
    if (userAccount == null) {
        //create new account
        console.log("create new account...");
        
        var newAccount = new account({
            username : rUsername,
            password : rPassword,

            lastAuthentication : Date.now()
        });
        await newAccount.save();

        res.send(newAccount);
        return;
    } else {
        if (rPassword == userAccount.password) {
            userAccount.lastAuthentication = Date.now();
            await userAccount.save();

            console.log("getting account...")
            res.send(userAccount);
            return;
        }
    }

    res.send('invalid user/password');
    return;
});

app.listen(keys.port, () => {
    console.log("Listening on " + keys.port);
});