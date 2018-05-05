const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const cleanup = require('../cleanup.js');
const EventEmitter = require('events');

const expect = chai.expect;
chai.use(sinonChai);

describe('Cleanup tests', function() {
	let processMock;

	beforeEach(function() {
		processMock = new EventEmitter();
		processMock.exit = function exit(code) {
			processMock.emit('exit', code);
		};
		cleanup.set('catchListenerErrors', false);
		cleanup.set('processModule', processMock);
		cleanup.init();
	});

	it('Can handle process.exit event', function(done) {
		const exitCode = 14;
		cleanup.set('listener', function(finish, { code }) {
			expect(code).to.equal(exitCode, `Process exited with the wrong exit code. Expecting exit code: ${exitCode}`);

			finish();
			done();
		});

		processMock.exit(exitCode);
	});

	it('Can handle uncaughtException event', function(done) {
		const errorObject = new Error('Testing error object');
		cleanup.set('listener', function(finish, { exception }) {
			expect(exception).to.equal(errorObject);

			finish();
			done();
		});

		processMock.emit('uncaughtException', errorObject);
	});

	it('Can handle unhandledRejection event', function(done) {
		const rejectionReason = 'Testing rejection message';
		const promiseObject = Promise.resolve(5);
		cleanup.set('listener', function(finish, { reason, promise }) {
			expect(reason).to.equal(rejectionReason, 'Cleanup invoked listener with wrong unhandled rejection');
			expect(promise).to.equal(promiseObject, 'Cleanup invoked listener on unhabdledRejection with different or wrong promise object');

			finish();
			done();
		});

		processMock.emit('unhandledRejection', rejectionReason, promiseObject);
	});

	it('Can timeout', function(done) {
		const timeout = 100;
		cleanup.set('timeout', timeout);
		cleanup.set('listener', () => {});

		sinon.spy(processMock, 'exit');
		processMock.exit(1);

		setTimeout(function() {
			expect(processMock.exit, 'Cleanup did not invoke exit function within timeout').to.have.been.calledTwice;
			processMock.exit.restore();
			done();
		}, timeout + 100);
	});

	it('Can call exit() after finish() is called', function(done) {
		sinon.spy(processMock, 'exit');

		cleanup.set('listener', function(finish) {
			finish();
			expect(
				processMock.exit,
				'Cleanup did not call exit() again after finish() was invoked',
			).to.have.be.calledOnce;
			done();
		});

		processMock.emit('SIGTERM');
	});

	const signalsToHandle = ['SIGTERM', 'SIGINT', 'SIGHUP'];
	signalsToHandle.forEach(function(sig) {
		it(`Can handle ${sig} signal`, function(done) {
			cleanup.set('listener', function(finish, { signal }) {
				expect(signal).to.equal(sig, `Signal event "${sig}" was not passed correct "signal" argument. Instead was passed ${signal}`);

				finish();
				done();
			});
			processMock.emit(sig, sig);
		});
	});
});
