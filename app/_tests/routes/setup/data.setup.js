/*
* Populate a DB with fake data
*/
const mongoose = require('mongoose');
const config = require('config');
const Post = require('rfr')('app/models/post.js');
const Star = require('rfr')('app/models/star.js');


// dirty fix for mocha issue with mongoose model redefinition between tests
mongoose.models = {};
mongoose.modelSchemas = {};
const ObjectId = mongoose.Types.ObjectId;

/*
* ! Ensure that enough posts, comments and stars are created
* so that each category has an ammount of posts at least
* equal to the default page size, and to allow testing of paging.
*/
const settings = {
	categories: config.get('categories.enum'),
	postsToCreate: config.get('categories.enum').length * config.get('paging.defaultSize'),
	postsToComment: -1, // how many posts will get commented on
	postsToStar: -1,
	commentsToGive: 4, // if  a post will get commented on, how many comments
	starsToGive: 4,
};
settings.postsToComment = Math.floor(settings.postsToCreate / 2);
settings.postsToStar = Math.floor(settings.postsToCreate / 2);

/**
* Contains information about the mock data populated in the database
* Should be used by tests as a reference, to compare their results against
*/
const data = {
	categories: settings.categories,
	posts: [],
	comments: [],
	topLevelPosts: [/* posts without parents */],
	postsByCategory: {
		// contains arrays of posts, grouped by their category
	},
	commentsByPost: {
		// contains arrays of comments, grouped by their parent
	},
	stars: [],
};

/**
* Collection of methods to help create and transform mock docments (to be inserted in the DB)
*/
const dataUtils = {
	buildPost: function(index, titlePrefix, bodyPrefix, category, comments = 0, stars = 0, parent = null) {
		return {
			title: `${titlePrefix} ${index}`,
			body: `${bodyPrefix} ${index}`,
			category,
			comments,
			stars,
			parent,
			_id: new ObjectId().toString(),
		};
	},
	createPosts: function() {
		for (const category of settings.categories) {
			data.postsByCategory[category] = [];
		}

		for (let i = 0; i < settings.postsToCreate; i++) {
			const category = settings.categories[i % settings.categories.length];
			const post = dataUtils.buildPost(i, 'Post', 'Body', category, 0, 0, null);

			data.posts.push(post);
			data.topLevelPosts.push(post);
			data.postsByCategory[category].push(post);
		}
	},
	createComments: function() {
		for (let i = 0; i < settings.postsToComment; i++) {
			const parentPost = data.topLevelPosts[i % data.topLevelPosts.length];

			if (data.commentsByPost[parentPost._id] === undefined) {
				data.commentsByPost[parentPost._id] = [];
			}

			for (let x = 0; x < settings.commentsToGive; x++) {
				const comment = dataUtils.buildPost(`${i} - ${x}`, 'Comment Title', 'Comment Body', parentPost.category, 0, 0, parentPost._id);

				parentPost.comments += 1;
				data.posts.push(comment);
				data.postsByCategory[parentPost.category].push(comment);
				data.comments.push(comment);
				data.commentsByPost[parentPost._id].push(comment);
			}
		}
	},
	createStars: function() {
		for (let i = 0; i < settings.postsToStar; i++) {
			const parentPost = data.posts[i % data.posts.length];

			for (let x = 0; x < settings.starsToGive; x++) {
				const star = { parent: parentPost._id, category: parentPost.category };
				parentPost.stars += 1;
				data.stars.push(star);
			}
		}
	},
	/**
	* Append a fake timestamp to the posts to ensure their order in the DB
	* Create the timestamp as an ISO string to match the DB return format
	* Timestamps are appended to ensure the first elements in the data array
	* are the most recent ones
	*/
	appendFakeTimestamps: function() {
		let nextTimestamp = Date.now();
		data.posts.forEach(function(post) {
			nextTimestamp -= 1;
			post.timestamp = new Date(nextTimestamp).toISOString();
		});
	},
	/**
	* Should be called AFTER inserting documents into the DB
	*/
	transformIdField: function() {
		data.posts.forEach(function(post) {
			post.id = post._id;
			delete post._id;
		});
	},
};

function teardown() {
	const db = mongoose.connection.db;
	return db.dropDatabase().then(() => {
		data.posts = [];
		data.comments = [];
		data.topLevelPosts = [];
		data.postsByCategory = {};
		data.commentsByPost = {};
		data.stars = [];
	});
}

function init() {
	return teardown().then(function() {
		dataUtils.createPosts();
		dataUtils.createComments();
		dataUtils.createStars();
		dataUtils.appendFakeTimestamps();
	})
	.then(function() {
		return Promise.all([
			Post.insertMany(data.posts),
			Star.insertMany(data.stars),
		]);
	}).then(dataUtils.transformIdField);
}

module.exports = {
	init,
	teardown,
	data,
};
