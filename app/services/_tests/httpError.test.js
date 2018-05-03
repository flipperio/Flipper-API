// const chai = require('chai');
// const httpError = require('../httpError.js');
//
// const expect = chai.expect;
//
//
// describe('HttpError tests', function() {
// 	httpError.set('throwOnNotFound', true);
// 	const requiredKeys = ['error', 'message', 'code'];
//
// 	it('Can build general error', function() {
// 		const errorInfo = { error: 'Error', message: 'A msg', code: 14 };
// 		expect(httpError.build('general', errorInfo)).to.include(errorInfo);
// 	});
// 	it('Can append data to general error', function() {
// 		const append = { extra: 4 };
// 		const errorInfo = {
// 			error: 'Error',
// 			message: 'A msg',
// 			code: 14,
// 			append,
// 		};
// 		const expectedOutput = Object.assign({}, errorInfo, append);
// 		delete expectedOutput.append;
//
// 		expect(httpError.build('general', errorInfo)).to.include(expectedOutput);
// 	});
//
// 	it('Can build an internal error', function() {
// 		const source = 'somewhere';
// 		const output = httpError.build('internal', { source });
// 		expect(output).to.include.all.keys(requiredKeys);
// 		expect(output).to.include({ source });
// 	});
//
// 	it('Can build a query error', function() {
// 		const message = 'A query error message';
// 		const output = httpError.build('query', { message });
// 		expect(output).to.include.all.keys(requiredKeys);
// 		expect(output.message).to.equal(message);
// 	});
//
// 	it('Can throw an error on a non existent builder type', function() {
// 		const badCall = () => httpError.build('NonExistingType');
// 		expect(badCall).to.throw();
// 	});
// });
