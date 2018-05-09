const chai = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
const setup = require('./setup/setup.js');

const expect = chai.expect;

describe('Route - POST Post', function() {
	this.timeout(4000);

	before(function() {
		return setup.init();
	});
	after(function() {
		return setup.teardown();
	});

	const request = supertest(setup.app);
	const path = `/${setup.expectations.apiPath}/posts`;
	const expectedContentType = setup.expectations.contentType;
	const examplePost = {
		title: setup.utils.generateString(20),
		body: setup.utils.generateString(120),
		category: setup.data.categories[0],
	};
	const veryLongString = setup.utils.generateString(1000); // cache for later use (to avoid regeneration in loop)

	it('Can make basic a post', function(done) {
		request.post(path)
		.send(examplePost)
		.expect('Content-Type', expectedContentType)
		.expect(201)
		.end(function(err, res) {
			if (err) {
				return done(err);
			}

			expect(res.body.id).to.be.a('string');
			done();
		});
	});
	it('Can make a comment', function(done) {
		const postWithParent = Object.assign({}, examplePost);
		postWithParent.parent = setup.data.topLevelPosts[0].id.toString();

		// const mongoose = require('mongoose');
		// const Post = mongoose.model('Post');
		// Post.find(function(err, res) {
		// 	console.log(res);
		// 	done();
		// });

		request.post(path)
		.send(postWithParent)
		.expect('Content-Type', expectedContentType)
		.expect(201)
		.end(function(err, res) {
			if (err) {
				return done(err);
			}

			expect(res.body.id).to.be.a('string');
			done();
		});
	});

	it('Can get error for making a comment on a comment', function(done) {
		const commentOnComment = Object.assign({}, examplePost);
		commentOnComment.parent = setup.data.comments[0].id.toString();

		request.post(path)
		.send(commentOnComment)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});
	it('Can can get error for comment with non existent parent', function(done) {
		const postWithBadParent = Object.assign({}, examplePost);
		postWithBadParent.parent = new mongoose.Types.ObjectId(setup.utils.randomInt(0, 160));

		request.post(path)
		.send(postWithBadParent)
		.expect('Content-Type', expectedContentType)
		.expect(404, done);
	});

	it('Can get error for non existent category param', function(done) {
		const badPost = Object.assign({}, examplePost);
		badPost.category = 'THERE_IS_NO_WAY_THIS_CATEGORY_EXISTS';

		request.post(path)
		.send(badPost)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});

	const propertiesToInvalidate = ['title', 'body', 'category'];
	propertiesToInvalidate.forEach(function(prop) {
		it(`Can get error for no ${prop} param`, function(done) {
			const badPost = Object.assign({}, examplePost);
			delete badPost[prop];

			request.post(path)
			.send(badPost)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
		});
		it(`Can get error for empty ${prop} param`, function(done) {
			const badPost = Object.assign({}, examplePost);
			badPost[prop] = '';

			request.post(path)
			.send(badPost)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
		});
		if (prop !== 'category') {
			it(`Can get error for ${prop} param too large`, function(done) {
				const badPost = Object.assign({}, examplePost);
				badPost[prop] = veryLongString;

				request.post(path)
				.send(badPost)
				.expect('Content-Type', expectedContentType)
				.expect(400, done);
			});
		}
	});
});
