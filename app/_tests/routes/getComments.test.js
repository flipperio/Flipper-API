const chai = require('chai');
const supertest = require('supertest');
const setup = require('./setup/setup.js');

const expect = chai.expect;

describe('Route - GET Comments', function() {
	this.timeout(4000);

	let parentIds = [];
	let firstParentId;

	before(function() {
		return setup.init().then(function() {
			parentIds = Object.keys(setup.data.commentsByPost);
			firstParentId = parentIds[0];
		});
	});
	after(function() {
		return setup.teardown();
	});

	const request = supertest(setup.app);
	const path = id => `/${setup.expectations.apiPath}/posts/${id}/comments`;
	const expectedContentType = setup.expectations.contentType;

	for (const parentId in setup.data.commentsByPost) {
		it(`Can get comments for parent post ${parentId}`, function(done) {
			request.get(path(parentId))
			.expect('Content-Type', expectedContentType)
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				const expectedResults = setup.data.commentsByPost[parentId];

				expect(res.body).to.be.an('array');
				expect(res.body).have.deep.ordered.members(expectedResults);
				done();
			});
		});
	}

	// assumes that any post with comments, has at least 2 comments
	it('Can get comments with regard to count and paging', function(done) {
		const count = 1;
		const page = 2;

		request.get(`${path(firstParentId)}/?count=${count}&page=${page}`)
		.expect('Content-Type', expectedContentType)
		.expect(200)
		.end(function(err, res) {
			if (err) {
				return done(err);
			}

			const pagingStartIndex = (page - 1) * (count);
			const pagingEndIndex = (pagingStartIndex + count);
			const expectedResults = setup.data.commentsByPost[firstParentId].slice(pagingStartIndex, pagingEndIndex);

			expect(res.body).to.be.an('array').that.has.lengthOf(count);
			expect(res.body).have.deep.ordered.members(expectedResults);
			done();
		});
	});

	it('Can get error if count parameter is too large', function(done) {
		request.get(`${path(firstParentId)}/?count=10000000`)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});

	it('Can get error if count parameter is not a number', function(done) {
		request.get(`${path(firstParentId)}/?count=THIS_AINT_A_NUM`)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});

	it('Can get error if page parameter is not a number', function(done) {
		request.get(`${path(firstParentId)}/?page=THIS_AINT_A_NUM`)
		.expect('Content-Type', expectedContentType)
		.expect(400, done);
	});

	it('Can get an error if parent id is invalid or non existent', function(done) {
		request.get(path('THIS_SHOULD_NOT_EXIST'))
		.expect('Content-Type', expectedContentType)
		.expect(404, done);
	});
});
