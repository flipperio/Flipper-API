const querySchema = require('./querySchema.js');

module.exports = function(app, { httpError, Star, queryValidator, path = '/posts/:postId' } = {}) {
	const validationOptions = { useDefaults: true, coerceTypes: true, removeAdditional: 'all' };
	const validator = queryValidator(httpError, querySchema, validationOptions, 'body');

	function route(req, res, next) {
		if (req.post.parent) {
			const httpErr = httpError.build('query', { message: 'Cannot star a comment' });
			return next(httpErr);
		}
		else if (req.body.star === false) {
			return res.status(200).json({ star: false });
		}

		Star.create({ parent: req.post._id, category: req.post.category }, function(err) {
			if (err) {
				return next(httpError.build('internal', { source: 'DATABASE', errorObject: err }));
			}

			res.status(200).json({ star: true });
		});
	}
	app.post(path, [validator, route]);
};
