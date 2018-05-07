/*
* Establish a local DB connection for testing
*/
require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
	init: function init() {
		const dbUri = process.env.DB_TEST_URI;
		return mongoose.connect(dbUri, { autoIndex: false });
	},
	disconnect: function disconnect() {
		return mongoose.disconnect();
	},
};
