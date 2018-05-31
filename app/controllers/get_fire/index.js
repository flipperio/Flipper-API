const config = require('config');
const querySchema = require('./querySchema.js');

module.exports = function(app, { httpError, Post, Star, queryValidator, path = '/posts/fire' } = {}) {
	const validationOptions = { coerceTypes: true, removeAdditional: 'all' };
	const resultsToGet = config.get('fire.count');
	const inRecentHours = config.get('fire.inRecentHours');

	/**
	* Build an aggregation pipeline to get on fire posts.
	*
	* @param {string} fireType - Specify what kind of onFire posts this pipeline is for.
	* Should be either "comments" or "stars". Used to append a "comments" or "stars" count property.
	* @param {string} category - Category to filter on fire posts by
	*/
	function buildFirePipeline(fireType, category) {
		const dateThreshold = new Date();
		dateThreshold.setHours(dateThreshold.getHours() - inRecentHours);

		return [
			{ $match: {
				category: category,
				parent: { $ne: null },
				// timestamp: { $gte: dateThreshold.getTime() },
			} },
			{ $group: {
				_id: '$parent',
				count: { $sum: 1 },
			} },
			{ $sort: { count: -1 } },
			{ $limit: resultsToGet },
			{ $lookup: {
				from: 'posts',
				localField: '_id',
				foreignField: '_id',
				as: 'post',
			} },
			// add a "stars" or "comments" field to the objects in "post"
			{ $addFields: { [`post.${fireType}`]: '$count' } },
			{ $project: {
				_id: false,
				post: { $arrayElemAt: ['$post', 0] },
			} },
			{ $sort: {
				'post.timestamp': -1,
			} },
		];
	}

	const validator = queryValidator(httpError, querySchema, validationOptions, 'query');

	function aggregate(req, res, next) {
		const category = req.query.category;

		Promise.all([
			Post.aggregate(buildFirePipeline('comments', category)).exec(),
			Star.aggregate(buildFirePipeline('stars', category)).exec(),
		])
		.then(
			function(aggregationsResults) {
				req.results = aggregationsResults;
				next();
			},
			function(aggregateErr) {
				next(httpError.build({ source: 'DATABASE', errorObject: aggregateErr }));
			},
		);
	}

	// join the results, trim properties, and remove duplicates
	function joinResults(req, res, next) {
		const joinedResults = [];

		for (const resultArray of req.results) {
			for (const result of resultArray) {
				const post = result.post;
				// temp fix for comments without parents -> see Trello for relevant card
				if (!post || Object.keys(post) === 0) {
					continue;
				}
				post.id = post._id;
				delete post._id;

				// Both aggregation pipelines may have returned the same post
				const isDuplicate = joinedResults.some(function(joinedPost) {
					return joinedPost.id.toString() === post.id.toString();
				});

				if (isDuplicate === false) {
					joinedResults.push(post);
				}
			}
		}

		req.results = joinedResults;

		next();
	}

	// get the star and comment counts for each post
	function resolveCounts(req, res, next) {
		const countResolutions = [];
		const catchCountQueryError = (countQueryErr) => {
			const httpErr = httpError.build('internal', { source: 'DATABASE', errorObject: countQueryErr });
			return Promise.reject(httpErr);
		};

		req.results.forEach(function(post) {
			if (post.comments === undefined) {
				const resolveCommentCount = Post.count({ parent: post.id }).exec().then(
					function(comments) {
						post.comments = comments;
					},
					catchCountQueryError,
				);

				countResolutions.push(resolveCommentCount);
			}
			if (post.stars === undefined) {
				const resolveStarCount = Star.count({ parent: post.id }).exec().then(
					function(stars) {
						post.stars = stars;
					},
					catchCountQueryError,
				);

				countResolutions.push(resolveStarCount);
			}
		});

		Promise.all(countResolutions).then(
			function() {
				next();
			},
			next,
		);
	}

	function respond(req, res) {
		res.status(200).json(req.results);
	}

	app.get(path, [validator, aggregate, joinResults, resolveCounts, respond]);
};
