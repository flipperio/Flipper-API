const supertest = require('supertest');
const mongoose = require('mongoose');
const setup = require('./setup/setup.js');

describe('Route - POST Star', function() {
	this.timeout(4000);

	before(function() {
		return setup.init();
	});
	after(function() {
		return setup.teardown();
	});

	const request = supertest(setup.app);
	const path = postId => `/${setup.expectations.apiPath}/posts/${postId}`;
	const expectedContentType = setup.expectations.contentType;
	const requestBody = { star: true };

	it('Can star a post', function(done) {
		const postId = setup.data.posts[0].id;
		request.post(path(postId))
		.send(requestBody)
		.expect('Content-Type', expectedContentType)
		.expect(200, done);
	});

	it('Can get error for invalid post id', function(done) {
		const postId = new mongoose.Types.ObjectId(setup.utils.randomInt(0, 160));
		request.post(path(postId))
		.send(requestBody)
		.expect('Content-Type', expectedContentType)
		.expect(404, done);
	});

	it('Can get an error for invalid star param', function(done) {
		const postId = setup.data.posts[0].id;
		request.post(path(postId))
		.send({ star: 'THIS_IS_NOT_A_BOOLEAN' })
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});
});
