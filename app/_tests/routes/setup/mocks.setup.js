/*
* Establish various mock objects and modules used by the API routes
*/
const httpError = require('rfr')('/app/services/httpError.js');
const Post = require('rfr')('/app/models/post.js');
const Star = require('rfr')('/app/models/star.js');

module.exports = {
	handler: {
		handle: function(error, data) {
			// eslint-disable-next-line no-console
			console.error('TESTING - Route error: ', error, data);
		},
	},
	httpError,
	Post,
	Star,
};
