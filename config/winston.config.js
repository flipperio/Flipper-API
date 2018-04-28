/*
* For winston transport documentation go to
* github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport
*/

/*
* Winston Logging Levels (Same as NPM)
* error: 0,
* warn: 1,
* info: 2,
* verbose: 3,
* debug: 4,
* silly: 5
*/

const appRoot = require('app-root-path');
const path = require('path');

let logFilename = 'server.log';

if (process.env.NODE_ENV !== 'production') {
	logFilename = 'server.dev.log';
}

const config = {
	file: {
		level: 'warn',
		filename: path.join(appRoot.path, `/logs/${logFilename}`),
		timestamp: true,
		showLevel: true,
		eol: '\n\n',
		json: true,
		prettyPrint: true,
		maxSize: 5242880,
		maxFiles: 6,
		colorize: false,
	},
	console: {
		level: 'debug',
		humanReadableUnhandledException: true,
		json: false,
		colorize: true,
	},
};
module.exports = config;
