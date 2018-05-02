/**
* Module to build HTTP error response objects in a uniform manner
*
* Response from building an error is an object with 2 properties
* {object} payload - Response to send to client
* {object} internal - Information for internal applicaiton usage
*
* To add additional HTTP error types, add a new function to the "builders" object
* The function should return the result of callng the "builders.general" function in order to
* ensure all errors are unifrom in structure
*/

const builders = {};

builders.general = function general({ meta = {},
	append = {},
	appendInternal = {},
	error = 'General',
	message = 'An error has occured',
	code = 1,
	status = 400,
	errorObject } = {}) {
	const errorResponse = {
		payload: { // Object to send to client
			error, // {string} title to send to cleint
			message,
			code, // {number} application level status code
			meta, // {object} additional meta information
		},
		internal: { // meta information for internal application usage
			status, // {number} HTTP status code
			errorObject,
		},
	};

	if (typeof appendInternal === 'object') {
		errorResponse.internal = Object.assign(errorResponse.internal, appendInternal);
	}
	if (typeof append === 'object') {
		errorResponse.payload = Object.assign(errorResponse.payload, append);
	}

	return errorResponse;
};

builders.internal = function internal({ source = 'SERVER', status = 500, errorObject } = {}) {
	return builders.general({
		error: 'Internal',
		message: 'An internal error has occured',
		status,
		errorObject,
		append: { source },
	});
};

builders.query = function query({ message = 'Invalid, malformed, or missing query arguments have been passed', status = 400 } = {}) {
	return builders.general({
		error: 'Query',
		message,
		status,
	});
};

builders.notFound = function notFound({ message = 'The requested resource could not be found', status = 404 } = {}) {
	return builders.general({
		error: 'Not Found',
		message,
		status,
	});
};

/**
* Build HTTP error objects in a uniform and consistent manner
* @property {function} set - Set the value of a setting. First param is {string} setting name, and second
* is the settings' value
*
* @property {function} build - Builds an error object. First parameter is {string} error-builder function name
* Second param is an object to pass the the builder function.
* If an error-builder function with the specified name does not exist an error will be thrown, unless
* the "throwOnNotFound" setting is set to false
*/
const httpError = {
	settings: {
		throwOnNotFound: true,
	},
	set: function set(name, value) {
		httpError.settings[name] = value;
	},
	build: function build(type, options) {
		const builder = builders[type];
		if (builder === undefined) {
			if (httpError.settings.throwOnNotFound === true) {
				throw new Error(`httpError builder with type "${type}" does not exist`);
			}
			else {
				return {};
			}
		}
		return builder(options);
	},
};

module.exports = httpError;
