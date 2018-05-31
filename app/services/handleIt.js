
/**
* Module for logging errors (or other data) in a consistent and uniform matter manner
* Does not currently support async middleware.
*
* Register a logger by calling "set('logger', someLogger)"
* logger must contain a "log" method that accepts ->
* {object} error, {string} message, and {object} meta, parameters (in that order)
*
* To log some data, call "handleError(errorObject, data)"
*
* Middleware can be registered that will modify the log data before it is logged.
* To add middleware call "addMiddleware(fn)"
*
* Attempting to log data without first registering a "logger" will NOT throw an error.
* If you want an error to be thrown for this, call "set('throwOnNoLogger', true)"
*/
module.exports = (function() {
	const settings = {
		logger: undefined,
		throwOnNoLogger: false,
		exitSignal: 'SIGINT',
		middleware: [],
	};

	function set(name, value) {
		settings[name] = value;
	}

	/**
	* @typedef {object} logData
	* Information about a log
	* @property {string} message - Message to log
	* @property {string} level - Level to log at
	* @property {object} meta - Meta data to log
	* @property {string} meta.type - The general type of the error
	* @property {string} meta.subType - A more specific type of the error
	* @property {object} meta.error - The error object itself
	* @property {boolean} meta.exit - If the program should exit after logging
	*/

	/**
	* Add a middleware function to process log data before it is logged, or perform
	* some actions before logging the data
	*
	* The middleware function will be passed a REFERENCE to the log data
	* See @typedef logData for the structure of this object
	*/
	function addMiddleware(middlewareFn) {
		if (typeof middlewareFn !== 'function') {
			return;
		}

		settings.middleware.push(middlewareFn);
	}
	function removeMiddleware(middlewareFn) {
		let matchingIndex = -1;
		for (let i = 0; i < settings.middleware.length; i++) {
			if (settings.middleware[i] === middlewareFn) {
				matchingIndex = i;
				break;
			}
		}
		if (matchingIndex >= 0) {
			settings.middleware.splice(matchingIndex, 1);
		}
	}

	/**
	* Log some data, appending metadata in a predefined structure.
	*
	* @param {object} [error] - Error object (optional)
	*
	* @param {object} [data] - Extra data about the error (optional)
	* @param {string} [data.type] - The type of error that occurred
	* @param {string} [data.subType] - A more specific type of the error
	*
	* @param {string} [data.message=] - The message to log. If not specified, will default to the param "error.message".
	* If the "error" param is undefined or does not contain a "message" property, then a default placeholder
	* message will be used
	*
	* @param {string} [data.level='error'] - The log level to log at. Defaults to "error".
	* @param {boolean} [data.exit=false] - If the program should exit after logging. Will exit by sending the "exitSignal" setting to the current process. Defaults to false.
	*
	* @param {object} [append] - Additional properties to append to the meta information of the log (optional)
	*
	*
	*
	* The "logger.log" method will be passed an object containing {type, subType, error} as its "meta" parameter.
	*/
	function handle(error, { type, subType, message, level = 'error', exit = false } = {}, append) {
		const data = {
			message: 'Unspecified error message',
			level,
			meta: {
				type,
				subType,
				error,
				exit,
			},
		};

		if (message) {
			data.message = message;
		}
		else if (error && error.message) {
			data.message = error.message;
		}
		if (typeof append === 'object') {
			data.meta = Object.assign(data.meta, append);
		}

		for (const middleware of settings.middleware) {
			middleware(data);
		}

		if (settings.logger) {
			settings.logger.log(data.level, data.meta.error || data.message, data.meta, function() {
				if (data.meta.exit === true) {
					process.kill(process.pid, settings.exitSignal);
				}
			});
		}
		else if (settings.throwOnNoLogger === true) {
			throw new Error('HandleIt unable to log error because settings.logger is undefined');
		}
	}

	return { handle, addMiddleware, removeMiddleware, set };
}());
