const config = require('config');

module.exports = {
	type: 'object',
	properties: {
		category: {
			type: 'string',
			enum: config.get('categories.enum'),
		},
	},
	required: ['category'],

};
