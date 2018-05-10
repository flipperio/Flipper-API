const Ajv = require('ajv');

/**
* Builds an Express middleware function to validate a query against
* a provided JSON schema.
*/
module.exports = function(httpError, jsonSchema, schemaOptions, propertyToValidate = 'query') {
	const ajvInstance = new Ajv(schemaOptions);
	const validate = ajvInstance.compile(jsonSchema);

	return function(req, res, next) {
		const query = req[propertyToValidate];
		const isValid = validate(query);
		if (isValid === true) {
			next();
		}
		else {
			next(httpError.build('query', { message: ajvInstance.errorsText(validate.errors) }));
		}
	};
};
