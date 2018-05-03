const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const handleIt = require('../handleIt.js');

const expect = chai.expect;
chai.use(sinonChai);

describe('HandleIt tests', function() {
	const log = sinon.spy();
	const loggerMock = { log: log };
	handleIt.set('logger', loggerMock);

	beforeEach(function() {
		loggerMock.log.resetHistory();
	});

	it('Can log with correct parameters', function() {
		const errorMessage = 'A sample error';
		const err = new Error(errorMessage);
		const data = {
			type: 'Testing',
			subType: 'Mocha',
		};

		handleIt.handle(err, data);
		expect(log).to.have.been.calledWith('error', errorMessage, {
			type: data.type,
			subType: data.subType,
			error: err,
			exit: false,
		});
	});

	it('Can log with a custom message', function() {
		const message = 'A custom message';

		handleIt.handle(undefined, { message });
		expect(log).to.have.been.calledWith('error', message);
	});

	it('Can log with a custom log level', function() {
		const level = 'info';

		handleIt.handle(undefined, { level });
		expect(log).to.have.been.calledWith(level);
	});

	it('Can allow middleware to modify data', function() {
		const meta = {
			type: 'Middleware Type',
			subType: 'Middleware subType',
			error: 'Error is now string',
			exit: false,
		};
		const message = 'A middleware message';

		// middleware to change the "meta" property of the data
		function middlewareA(data) {
			data.meta = meta;
		}
		// middleware to change the "message" property of the data
		function middlewareB(data) {
			data.message = message;
		}

		handleIt.addMiddleware(middlewareA);
		handleIt.addMiddleware(middlewareB);
		handleIt.handle();

		expect(log).to.have.been.calledWith('error', message, meta);
	});

	it('Can throw on no logger', function() {
		handleIt.set('logger', undefined);
		const badCall = () => handleIt.handle();
		expect(badCall).to.throw;
	});
});
