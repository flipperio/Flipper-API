const querySchema = require('./querySchema.js');
const validatePostId = require('../_utils/validatePostId');

module.exports = function(app, { httpError, Post, queryValidator, path = '/posts' } = {}) {
	const validationOptions = { coerceTypes: true, removeAdditional: 'all' };
	const validator = queryValidator(httpError, querySchema, validationOptions, 'body');

	function validateIdParam(req, res, next) {
		if (!req.body.parent) {
			return next();
		}

		validatePostId(httpError, Post, req.body.parent).then(function(post) {
			if (post.parent) {
				const httpErr = httpError.build('query', { message: 'Cannot comment on a comment' });
				next(httpErr);
			}
			else {
				req.body.parent = post._id;
				next();
			}
		})
		.catch(next);
	}

	function route(req, res, next) {
		Post.create(req.body, function(queryErr, createdPost) {
			if (queryErr) {
				return next(httpError.build('internal', { source: 'DATABASE', errorObject: queryErr }));
			}

			res.status(201).json({ id: createdPost._id });
		});
	}

	app.post(path, [validator, validateIdParam, route]);
};
