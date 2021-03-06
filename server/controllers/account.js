const Abstract = require("../models/abstract");
const counsellorModel = require("../models/counsellor");
const to = require("await-to-js").to;

exports.getAccount = async function (role, model, req, res) {
    var id = req.query.ID;
    var err, results;
    [err, results] = await to(model.lookupById(id));
    
    if (err) {
        return res.status(422).send({error: "Failed to lookup "+role+" account information."});
    }

    if (results.length === 0) {
        return res.status(422).send({error: "No such "+role+"."});
    }

    var user = results[0];
    if (user.password) {
        delete user.password;
    }

    if (role === "counsellor") {
        return res.status(201).send({counsellor: user});
    } else {
        return res.status(201).send({user: user});
    }
};

exports.updateAccount = async function (role, model, user, id, req, res) {
    // Check entered password before updating user information
    var err, users, isMatch;
    [err, users] = await to(model.lookupById(id));
    if (err) {
        return res.status(422).send({error: "Failed to lookup "+role+" account information."});
    }

    if (users.length === 0) {
        return res.status(422).send({error: "No such "+role+"."});
    }

    [err, isMatch] = await to(Abstract.comparePassword(req.body.password, users[0].password));

    if (err) {
        return res.status(422).send({error: "Failed checking password."});
    }

    if (!isMatch) {
        return res.status(422).send({error: "The provided password is incorrect."});
    }

    var results;
    [err, results] = await to(model.update(user, id));
    if (err) {
        return res.status(422).send({error: "Database "+role+" update error."});
    }

    if (results.changedRows === 0) {
        return res.status(422).send({error: "Failed to update "+role+" account information."});
    }

    return res.status(201).send({success: "Successfully updated "+role+"."});
};

exports.changePassword = async function (req, res, model) {
    var id = req.query.ID;
    var oldPassword = req.body.oldPassword;

    let err, oldPasswordHashed, newPasswordHashed, users, isMatch;

    [err, users] = await to(model.lookupById(id));
    if (err) {
        return res.status(422).send({error: "Failed to lookup user account information."});
    }

    if (users.length === 0) {
        return res.status(422).send({error: "No such user."});
    }

    [err, isMatch] = await to(Abstract.comparePassword(oldPassword, users[0].password));

    if (err) {
        return res.status(422).send({error: "Failed checking password."});
    }

    if (!isMatch) {
        return res.status(422).send({error: "The old password is incorrect."});
    }

    var newPassword = req.body.newPassword;

    [err, newPasswordHashed] = await to(Abstract.hashOne(newPassword));
    if (err) {
        return res.status(422).send({error: "Failed to encrypt password."});
    }

    if (!newPasswordHashed) {
        return res.status(422).send({error: "Failed to encrypt password."});
    }

    var user = {
        password: newPasswordHashed
    };

    [err, results] = await to(model.update(user, id));
    if (err) {
        return res.status(422).send({error: "Failed to change password."});
    }

    if (!results) {
        return res.status(422).send({error: "Failed to change password."});
    }

    return res.status(201).send({success: "Successfully changed password."});
};