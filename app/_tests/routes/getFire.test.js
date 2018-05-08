const supertest = require('supertest');
const setup = require('./setup/setup.js');


describe('Route - GET Fire', function() {
	this.timeout(4000);

	before(function() {
		return setup.init();
	});
	after(function() {
		return setup.teardown();
	});

	const request = supertest(setup.app);
	const path = `/${setup.expectations.apiPath}/posts/fire`;
	const expectedContentType = setup.expectations.contentType;

	it('Can get error on no category parameter', function(done) {
		request.get(path)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});

	it('Can get error for a non existent category', function(done) {
		request.get(`${path}/?category=THIS_SHOULD_NOT_EXIST`)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});
});
