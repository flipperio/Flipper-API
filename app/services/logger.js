const winston = require('winston');
const config = require('config');

const logger = new winston.Logger({
	transports: [
		new winston.transports.File(config.get('winston.file')),
		new winston.transports.Console(config.get('winston.console')),
	],
	exitOnError: true,
});

module.exports = logger;
