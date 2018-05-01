

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
