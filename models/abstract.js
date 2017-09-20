// Abstract model which implements common methods 
// for all models 

const db = require('../db.js');

// Create model 
// - Values should contain (ordered) values for SQL insert
// - model is name of model (string)
// - valueNames is string containing all values needed for creation
// - should have form: (ID, val1, val2, ...., valn)
exports.create = function(model, values, valueNames, res) {
	exports.count(model)
	.then(function(lastID) {
		var newVals = [lastID+1].concat(values);
		var unknowns = '(';
		for (var j=0; j<newVals.length; j++) {
			unknowns += '?'
			if (j!=newVals.length-1) unknowns += ', ';
		}
		unknowns += ')';
		db.get().query('INSERT INTO '+model+' '+valueNames+' VALUES '+unknowns+';',
			newVals, 
			function(err, model) {
				response(err, 400, model, 201, res);
			});
	}).catch(error => response(error, 400, null, null, res));
}

// Destroy model
// - model is name of model (string)
// - id is the id of the model to be destroyed
exports.destroy = function(model, id, res) {
	db.get().query('DELETE FROM '+model+' WHERE ID=?;', 
		[id], 
		function(err, result) {
			response(err, 400, { message: model+' deleted successfully' }, 204, res);
		});
}

// Update model 
// - model is name of model (string)
// - values is ordered set of values to update (should include model id last)
// - valueNames is array containing the names of the values to be inserted
// (not including id)
exports.update = function(model, values, valueNames, res) {
	var query = 'UPDATE '+model+' SET';
	for (var j=0; j<valueNames.length; j++) {
		query += ' '+valueNames[j]+'=?';
		if (j!=valueNames.length-1) query += ','
	}
	query += ' WHERE ID=?;';
	db.get().query(query, values, function(err, results) {
			response(err, 400, results[0], 200, res);
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

// Retrieve user specified by userID in params
exports.retrieve = function(model, id, res) {
	db.get().query('SELECT * FROM '+model+' WHERE ID=?;', 
		[id],
		function(err, result) {
			response(err, 400, result[0], 200, res);
		});
}

// List all models
// - model is name of model (string)
exports.list = function(model, res) {
	db.get().query('SELECT * FROM '+model+';', function(err,models) {
		response(err, 400, models, 200, res);
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

// Function to call when returning data or error
function response(err, errCode, data, dataCode, res) {
	if (err) {
		console.log('DB ERROR:: ' + err);
		res.status(errCode).send(err);
		return;
	}
	res.status(dataCode).send(data);
}

exports.response = response;



