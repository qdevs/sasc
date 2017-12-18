const express = require('express');

const apiRouter = express.Router();

const usersController = require('../models/user');

// testing, remove when done ---------------------------
// dummy post method works!
/*apiRouter.post('/register', (req, res) => {
  console.log('registering', req.body);
});*/
// -----------------------------------------------------



// testing, remove when done ---------------------------
// dummy post method works!
/*apiRouter.post('/login', (req, res) => {
  console.log('logging in', req.body);
})*/
// -----------------------------------------------------

apiRouter.post('/register', usersController.create);

//apiRouter.post('/login', usersController.retrieve);

module.exports = apiRouter;