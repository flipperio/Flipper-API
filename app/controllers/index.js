const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const getPosts = require('./get_posts/index.js');
const getComments = require('./get_comments/index.js');
const getFire = require('./get_fire/index.js');
const makePost = require('./make_post/index.js');
const starPost = require('./star_post/index.js');
const resolvePostId = require('./_other/resolvePostIdParam.js');
const notFoundHandler = require('./_other/notFoundHandler.js');
const errorHandler = require('./_other/errorHandler.js');
const queryValidator = require('./_middleware/queryValidator.js');

module.exports = function(app, { httpError, handler, Post, Star, path = '/api' }) {
	const router = express.Router();
	const injections = { httpError, handler, Post, Star, queryValidator };

	if (process.env.NODE_ENV !== 'production') {
		router.use(cors());
		router.options('*', cors());
	}
	router.post('*', bodyParser.json());
	resolvePostId(router, injections);
	getPosts(router, injections);
	getComments(router, injections);
	getFire(router, injections);
	makePost(router, injections);
	starPost(router, injections);
	notFoundHandler(router, injections);
	errorHandler(router, injections);

	app.use(path, [router]);
};
