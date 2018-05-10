const config = require('config');

module.exports = {
	type: 'object',
	properties: {
		category: {
			type: 'string',
			enum: config.get('categories.enum'),
		},
		title: {
			type: 'string',
			minLength: config.get('post.title.minLen'),
			maxLength: config.get('post.title.maxLen'),
		},
		body: {
			type: 'string',
			minLength: config.get('post.body.minLen'),
			maxLength: config.get('post.body.maxLen'),
		},
		parent: {
			type: 'string',
		},
	},
	required: ['category', 'title', 'body'],
};
