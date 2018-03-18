const jwt = require("jwt-simple");
const Abstract = require("../models/abstract");
const userModel = require("../models/user");
const counsellorModel = require("../models/counsellor");
const config = require("../../config");
const emailRegex = require('email-regex');
const isEmailValid = require('../models/abstract').isEmailValid;
const to = require("await-to-js").to;

function tokenForUser(user, role) {
    const timestamp = Date.now();                         // in milliseconds
    const expiry = (Date.now() + 60.0 * 60.0 * 1000.0) / 1000.0;    // An hour from now (in seconds)
    return jwt.encode({sub: user.ID, iat: timestamp, exp: expiry, role: role}, config.secret);
}

function convertToSentence(listOfNouns) {
    const len = listOfNouns.length;
    var str = "";

    listOfNouns.forEach(function (ignore, i) {
        if (i === 1) {
            // First word
            str += listOfNouns[i];
        } else if (i === len - 1) {
            // Last word
            str += ", and " + listOfNouns[i];
        } else {
            // In the middle of the list of words
            str += ", " + listOfNouns[i];
        }

    });

    return str;
}

async function abstractSignup(user, requiredCredentials, role, res, lookupUser, encryptPassword, create) {
    var error = false;
    var missingCredentials = [];

    Object.keys(requiredCredentials).forEach(function (property) {
        if (!requiredCredentials[property]) {
            error = true;
            missingCredentials.push(requiredCredentials[property]);
        }
    });

    if (error) {
        return res.status(422).send({error: "You must provide all of " + convertToSentence(missingCredentials) + "."});
    }

    var usernameCredential = requiredCredentials[Object.keys(requiredCredentials)[0]];

    // Check if user with their corresponding identifier already exists
    let err, users;
    [err, users] = await to(lookupUser(usernameCredential));

    if (err) {
        return res.status(422).send({error: "Cannot look up user."});
    }

    // If a user with the identifier already exists, return an error
    if (users[0] !== undefined && users[0] !== null) {
        return res.status(422).send({error: usernameCredential + " is in use."});
    }

    let result;
    [err, result] = await to(encryptPassword(user));
    user = result;

    if (user.ID === undefined || user.ID === null) {
        // Create a new user
        let results;
        [err, results] = await to(create(user));
        if (err) {
            return res.status(422).send({error: "Cannot create " + role + "."});
        }

        if (!results) {
            return res.status(422).send({error: "Cannot create " + role + "."});
        }

        user.ID = results.insertId;

        // Send token back to client
        res.json({token: tokenForUser(user, role)});

    } else {
        // Update existing user who took the pre-chat survey
        let results;
        [err, results] = await to(create(user.ID, user));
        if (err) {
            return res.status(422).send({error: "Cannot create " + role + "."});
        }

        if (!results) {
            return res.status(422).send({error: "Cannot create " + role + "."});
        }

        // Send token back to client
        res.json({token: tokenForUser(user, role)});
    }
};

exports.checkRoleAndGetInfo = async function (req, res) {
    try {
        const tokenContents = jwt.decode(req.body.token, config.secret);
        const role = tokenContents.role;
        const id = tokenContents.sub;
        var err, users;

        if (role === "user") {
            [err, users] = await to(userModel.lookupById(id));
            if (err) {
                return res.status(422).send({error: "Unable to lookup user."});
            }

            if (users.length === 0) {
                return res.status(422).send({error: "No such user."});
            }

            var user = users[0];
            delete user.password;

            return res.send({
                user: user,
                role: role
            });
        } else if (role === "counsellor") {
            [err, users] = await to(counsellorModel.lookupById(id));
            if (err) {
                return res.status(422).send({error: "Unable to lookup counsellor."});
            }

            if (users.length === 0) {
                return res.status(422).send({error: "No such counsellor."});
            }

            var user = users[0];
            delete user.password;

            return res.send({
                user: user,
                role: role
            });
        }

    } catch (e) {
        res.send({role: "none"});
    }
}

exports.signup = function (req, res) {

    var requiredCredentials = {
        username: req.body.username.trim(),
        password: req.body.password,
        email: req.body.email.trim()
    };

    // If email invalid, send error to frontend and return
    if (!isEmailValid(requiredCredentials.email, res)) {
        return;
    }

    if (req.body.ID === undefined || req.body.ID === null) {
        // Signing up without taking pre-chat survey
        var user = {
            username: req.body.username.trim(),
            nickname: req.body.nickname.trim(),
            password: req.body.password,
            age: req.body.age,
            gender: req.body.gender.trim(),
            phoneNumber: req.body.phoneNumber.trim(),
            email: req.body.email.trim(),
            registered: 1
        };

        abstractSignup(user, requiredCredentials, "user", res, userModel.lookupByUsername, Abstract.process, userModel.create);
    } else {
        // Signing up after taking pre-chat survey
        var user = {
            ID: req.body.ID,
            username: req.body.username.trim(),
            nickname: req.body.nickname.trim(),
            password: req.body.password,
            age: req.body.age,
            gender: req.body.gender.trim(),
            phoneNumber: req.body.phoneNumber.trim(),
            email: req.body.email.trim(),
            registered: 1
        };

        abstractSignup(user, requiredCredentials, "user", res, userModel.lookupByUsername, Abstract.process, userModel.update);
    }

};

exports.signin = function (req, res) {
    delete req.user.password;
    res.send({
        token: tokenForUser(req.user, "user"),
        user: req.user
    });
};

// Authentication for counsellors
exports.signinCounsellor = function (req, res) {
    delete req.user.password;
    res.send({
        token: tokenForUser(req.user, "counsellor"),
        counsellor: req.user
    });
};

exports.signupCounsellor = function (req, res) {
    var counsellor = {
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        email: req.body.email.trim(),
        password: req.body.password
    };

    var requiredCredentials = {
        email: req.body.email.trim(),
        password: req.body.password
    };

    // Check if email valid 
    if (!isEmailValid(requiredCredentials.email, res)) return;

    abstractSignup(counsellor, requiredCredentials, "counsellor", res, counsellorModel.lookupByEmail, Abstract.process, counsellorModel.create);
};
