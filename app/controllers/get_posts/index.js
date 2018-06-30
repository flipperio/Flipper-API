const querySchema = require('./querySchema.js');

module.exports = function(app, { httpError, Post, Star, queryValidator, path = '/posts' } = {}) {
	const validationOptions = { useDefaults: true, coerceTypes: true, removeAdditional: 'all' };

	const validator = queryValidator(httpError, querySchema, validationOptions, 'query');

	function route(req, res, next) {
		const query = req.query;

		const findConditions = { category: query.category, parent: null };
		const findOptions = { sort: '-timestamp', skip: (query.page - 1) * query.count, limit: query.count };

		Post.find(findConditions, null, findOptions).exec(function(queryErr, results) {
			if (queryErr) {
				return next(httpError.build('internal', { source: 'DATABASE', errorObject: queryErr }));
			}

			const resolveComments = [];
			const resolveStars = [];
			const catchCountQueryError = (countQueryErr) => {
				const httpErr = httpError.build('internal', { source: 'DATABASE', errorObject: countQueryErr });
				return Promise.reject(httpErr);
			};

			results.forEach(function(post, index) {
				results[index] = results[index].toObject();

				const countCommentsPromise = Post.count({ parent: post._id }).exec().then(
					function(comments) {
						results[index].comments = comments || 0;
					},
					catchCountQueryError,
				);

				const countStarsPromise = Star.count({ parent: post._id }).exec().then(
					function(stars) {
						results[index].stars = stars;
					},
					catchCountQueryError,
				);

				resolveComments.push(countCommentsPromise);
				resolveStars.push(countStarsPromise);
			});

			Promise.all([...resolveComments, ...resolveStars]).then(
				function() {
					res.status(200).json(results);
				},
				next,
			);
		});
	}

	app.get(path, [validator, route]);
};
