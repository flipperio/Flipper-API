const querySchema = require('./querySchema.js');

module.exports = function(app, { httpError, Post, Star, queryValidator, path = '/posts/:postId/comments' } = {}) {
	const validationOptions = { useDefaults: true, coerceTypes: true, removeAdditional: 'all' };
	const validator = queryValidator(httpError, querySchema, validationOptions, 'query');

	function route(req, res, next) {
		const query = req.query;
		const post = req.post;

		const findConditions = { parent: post._id };
		const findOptions = { sort: '-timestamp', skip: (query.page - 1) * query.count, limit: query.count };

		Post.find(findConditions, null, findOptions).exec(function(queryErr, results) {
			if (queryErr) {
				return next(httpError.build('internal', { source: 'DATABASE', errorObject: queryErr }));
			}

			const resolveStars = [];
			results.forEach(function(comment, index) {
				results[index] = results[index].toObject();
				const countStarsPromise = Star.count({ parent: comment._id }).exec().then(
					function(stars) {
						results[index].comments = 0;
						results[index].stars = stars;
					},
					function(countQueryErr) {
						const httpErr = httpError.build('internal', { source: 'DATABASE', errorObject: countQueryErr });
						return Promise.reject(httpErr);
					},
				);
				resolveStars.push(countStarsPromise);
			});

			Promise.all(resolveStars).then(
				function() {
					res.status(200).json(results);
				},
				next,
			);
		});
	}

	app.get(path, [validator, route]);
};
