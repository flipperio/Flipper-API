const config = require('config');

module.exports = {
	type: 'object',
	properties: {
		category: {
			type: 'string',
			enum: config.get('categories.enum'),
		},
		count: {
			type: 'integer',
			default: config.get('paging.defaultSize'),
			maximum: config.get('paging.maxSize'),
			minimum: 1,
		},
		page: {
			type: 'integer',
			default: 1,
			minimum: 1,
		},
	},
	required: ['category'],

};
