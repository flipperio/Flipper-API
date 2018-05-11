const querySchema = require('./querySchema.js');

module.exports = function(app, { httpError, Star, queryValidator, path = '/posts/:postId' } = {}) {
	const validationOptions = { useDefaults: true, coerceTypes: true, removeAdditional: 'all' };
	const validator = queryValidator(httpError, querySchema, validationOptions, 'body');

	function route(req, res, next) {
		if (req.body.star === false) {
			return res.status(200).json({});
		}

		const parentPost = req.post;

		Star.create({ parent: parentPost._id, category: parentPost.category }, function(err) {
			if (err) {
				return next(httpError.build('internal', { source: 'DATABASE', errorObject: err }));
			}

			res.status(200).json();
		});
	}
	app.post(path, [validator, route]);
};
