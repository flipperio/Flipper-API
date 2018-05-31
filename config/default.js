const winstonConfig = require('./winston.config.js');

const config = {
	winston: winstonConfig,
	mongoose: {
		connect: {
			autoIndex: false,
			bufferCommands: false,
			bufferMaxEntries: 0,
		},
	},
	categories: {
		enum: ['main', 'sci', 'pol', 'gov', 'anim'],
	},
	post: {
		title: {
			minLen: 4,
			maxLen: 46,
		},
		body: {
			minLen: 12,
			maxLen: 290,
		},
	},
	paging: {
		defaultSize: 10,
		maxSize: 30,
	},
	fire: {
		count: 5,
		inRecentHours: 6,

	},
};


module.exports = config;
