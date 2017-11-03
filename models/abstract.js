// Abstract model which implements common methods 
// for all models 

const db = require('../db.js');

// Create model 
// - Values should contain (ordered) values for SQL insert
// - model is name of model (string)
// - valueNames is string containing all values needed for creation
// - should have form: (ID, val1, val2, ...., valn)
// - if callback is specified, call callback instead of res
exports.create = function(model, values, valueNames, res, callback) {
	exports.count(model)
	.then(function(lastID) {
		var newVals = [lastID+1].concat(values);
		var unknowns = computeUnknowns(newVals.length);
		db.get().query('INSERT INTO '+model+' '+valueNames+' VALUES '+unknowns+';',
			newVals, 
			function(err, results) {
				if (res) httpResponse(err, 400, results, 201, res);
				else noHttpResponse(err, results, callback);
			});
	}).catch(error => {
		if (callback) callback(error);
		else httpResponse(error, 400, null, null, res)
	});
}

// Destroy model
// - model is name of model (string)
// - id is the id of the model to be destroyed
exports.destroy = function(model, id, res, callback) {
	db.get().query('DELETE FROM '+model+' WHERE ID=?;', 
		[id], 
		function(err, result) {
			if (res) httpResponse(err, 400, { message: model+' deleted successfully' }, 204, res);
			else noHttpResponse(err, result, callback)
		});
}

// Update model 
// - model is name of model (string)
// - values is ordered set of values to update (should include model id last)
// - valueNames is array containing the names of the values to be inserted
// (not including id)
exports.update = function(model, values, valueNames, res, callback) {
	var query = 'UPDATE '+model+' SET';
	var fieldQuery = fieldQueries(valueNames);
	query += fieldQuery + ' WHERE ID=?;';
	db.get().query(query, values, function(err, results, fields) {
			if (res) httpResponse(err, 400, results, 200, res);
			else noHttpResponse(err, results, callback)
	});
}

// Lookup model to pass to other functions
// - model is name of model (string)
// - id is id of model (int)
exports.lookup = function(model, id, req, res, callback) {
	db.get().query('SELECT * FROM '+model+' WHERE ID=?;', [id],
		function(err, results, fields) {
			if (err) {
				res.status(404).send(err);
				next();
			}
			req.model = results[0];
			callback();
		});
}

// Retrieve model by values instead of ID
exports.retrieveByValues = function(model, values, valueNames, callback) {
	var query = 'SELECT * FROM '+model+' WHERE';
	query += fieldQueries(valueNames,1);
	db.get().query(query, values, function(err,results,fields) {
			if (err) callback(err);
			callback(null, results);
		});
}

// Retrieve user specified by userID in params
// - if res is null, call callback upon completion
exports.retrieve = function(model, id, res, callback) {
	db.get().query('SELECT * FROM '+model+' WHERE ID=?;', 
		[id],
		function(err, result) {
			if (res) httpResponse(err, 400, result[0], 200, res);
			else noHttpResponse(err, result[0], callback)
		});
}

// Retrieve user specified by username in params
// Can't abstract because users use username while counsellors use email to login
exports.getUserCredentialsByUsername = function(username, res, callback) {
	db.get().query('SELECT username, password FROM user WHERE username = '+username+';',
		[username],
		function(err, result) {
			if (res) httpResponse(err, 400, result[0], 200, res);
			else noHttpResponse(err, result[0], callback);
		});
}

// Retrieve counsellor specified by email in params
// Can't abstract because users use username while counsellors use email to login
exports.getCounsellorCredentialsByEmail =  function(email, res, callback) {
	db.get().query('SELECT email, password FROM counsellor WHERE email = '+email+';',
		[email],
		function(err, result) {
			if (res) httpResponse(err, 400, result[0], 200, res);
			else noHttpResponse(err, result[0], callback);
		});
}

// Retrieve user or counsellor specified by username or email in params respectively
// The "user" in retrieveUserByIdentifier refers to the general term including both users and counsellors
exports.retrieveUserByIdentifier = function(model, loginID, res, callback) {
	var identifier = 'username';
	if (model === "counsellor") identifier = 'email';
	db.get().query('SELECT '+identifier+', password FROM '+model+' WHERE '+identifier+' = '+loginID+';',
		[loginID],
		function(err, result) {
			if (res) httpResponse(err, 400, result[0], 200, res);
			else noHttpResponse(err, result[0], callback);
		});
}

// List all models
// - model is name of model (string)
exports.list = function(model, res) {
	db.get().query('SELECT * FROM '+model+';', function(err,models) {
		httpResponse(err, 400, models, 200, res);
	});
}

// Counts the number of models
// - model is name of model (string)
exports.count = function(model) {	
	return new Promise(function(fulfill, reject) {
		db.get().query('SELECT COUNT(ID) AS count FROM '+model+';', function(err,results,fields) {			
			if (err) reject(err);
			fulfill(results[0].count);
		});	
	});
}

// Destroy all models
// Returns a promise that ensures the all models are removed when fulfilled
// THIS IS FOR TESTING PURPOSES
// ROUTING SHOULD ENSURE THAT THIS CANNOT BE CALLED IN THE APPLICATION
// - model is name of model (string)
exports.destroyAll = function(model) {
	return new Promise(function(fulfill, reject) {
		db.get().query('DELETE FROM '+model, function(err,result) {
			if (err) reject(err);
			fulfill();
		});
	});
}

// List all models corresponding to foreign key
// - model is name of model (string)
// - foreign key is name of foreign key (string)
// - id is id of foreign key
exports.listByForeignKey = function(model, fk, id, callback) {
	db.get().query('SELECT * FROM '+model+' WHERE '+fk+'=?', [id], 
		function(err, results, fields) {
			if (err) callback(err);
			callback(null,results);
		});
}

// Function to call when returning data or error in NON Http response
// - err is error (if any) 
// - data is data to return
// - toCall is function to call
function noHttpResponse(err,data,toCall) {
	if (err) toCall(err);
	else toCall(null,data);
}

// Function to call when returning data or error in Http response
function httpResponse(err, errCode, data, dataCode, res) {
	if (err) {
		console.log('DB ERROR:: ' + err);
		res.status(errCode).send(err);
		return;
	}
	res.status(dataCode).send(data);
}

// Compute string of (?,...,?) of length len
function computeUnknowns(len) {
	var unknowns = '(';
	for (var j=0; j<len; j++) {
		unknowns += '?'
		if (j!=len-1) unknowns += ', ';
	}
	unknowns += ')';	
	return unknowns;
}

// Compute string of ' field1=?, ... , fieldn=?'
// Returned string starts with a space!
// - if and === 1 use AND instead of commas
function fieldQueries(fields, and) {
	var query = '';
	for (var j=0; j<fields.length; j++) {
		query += ' '+fields[j]+'=?';
		if (j!=fields.length-1) {
			if (and) query += ' AND'
			else query += ',' 
		}
	}
	return query;
}

exports.noHttpResponse = noHttpResponse;
exports.httpResponse = httpResponse;


