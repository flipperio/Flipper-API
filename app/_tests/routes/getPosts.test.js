const chai = require('chai');
const supertest = require('supertest');
const setup = require('./setup/setup.js');
const config = require('config');

const expect = chai.expect;

describe('Route - GET Posts', function() {
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

	for (const category of setup.data.categories) {
		it(`Can get posts from category "${category}"`, function(done) {
			request.get(`${path}/?category=${category}`)
				.expect('Content-Type', expectedContentType)
				.expect(200)
				.end(function(err, res) {
					if (err) {
						return done(err);
					}

					const expectedSize = config.get('paging.defaultSize');
					const expectedOutput = setup.data.postsByCategory[category].slice(0, expectedSize);

					expect(res.body).to.be.an('array').that.has.lengthOf(expectedSize);
					expect(res.body).to.have.deep.ordered.members(expectedOutput);
					done();
				});
		});
	}

	it('Can get posts with regard to count and paging parameters', function(done) {
		const count = 2;
		const page = 2;
		const category = setup.data.categories[0];

		request.get(`${path}/?category=${category}&count=${count}&page=${page}`)
			.expect('Content-Type', expectedContentType)
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				const pagingStartIndex = (page - 1) * (count);
				const pagingEndIndex = (pagingStartIndex + count);
				const expectedOutput = setup.data.postsByCategory[category].slice(pagingStartIndex, pagingEndIndex);

				expect(res.body).to.be.an('array').that.has.lengthOf(count);
				expect(res.body).to.have.deep.ordered.members(expectedOutput);
				done();
			});
	});

	it('Can get error if count parameter is too large', function(done) {
		request.get(`${path}/?category=${setup.data.categories[0]}&count=50000000`)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
	});
	it('Can get error if count parameter is not a number', function(done) {
		request.get(`${path}/?category=${setup.data.categories[0]}&count=apples`)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
	});
	it('Can get error if page parameter is not a number', function(done) {
		request.get(`${path}/?category=${setup.data.categories[0]}&count=2&page=oranges`)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
	});

	it('Can get error for a non existent category', function(done) {
		request.get(`${path}/?category=THIS_SHOULD_NOT_EXIST`)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
	});

	it('Can get error on no category parameter', function(done) {
		request.get(`${path}`)
			.expect('Content-Type', expectedContentType)
			.expect(400, done);
	});
});
