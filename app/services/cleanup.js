/**
* Registers a clean up function to be executed before the program exits.
* The clean up function may be async except for when an "exit" event has been emitted
*
* Call "cleanup.init()" to initialize the cleanup module
* To register a cleanup listener, call "cleanup.set('listener', listenerFunction)"
*
***************************
* The listener function is passed the fallowing arguments
* {function} done - To be called by the listener when it has finished cleanup and is ready to exit
* Calling this on an "exit" event has no effect as "exit" does not allow for async listeners
*
* {object} cause - Object containing information about why the program is exiting
* {number} cause.code - Exit code
* {string} cause.signal - Exit signal
* {*} cause.exception - Uncaught exception
* {*} cause.reason - Reason of an unhandled promise rejection
* {*} cause.promise - A promise whose rejection was not handled
***************************
*
***************************
* If the "done" argument of the listener function is not called within a timeout
* the process will exit automatically.
* You can change this timeout by calling "cleanup.set('timeout', someNumber)"
****************************
*
***************************
* Errors that occur within the cleanup listener will be caught and the process will then exit immediately. This may not be desirable for unit tests.
* To disable this feature, call "cleanup.set('catchListenerErrors', false)"
***************************
*
* The "cleanup" event is emitted on the process module when a cleanup is going to be performed
* You do not need to listen to this "cleanup" event.
*
* The cleanup listener will only be called once for the first exit cause (uncaughtException, signal, etc...)
* Any subsequent exit causes will not be handled by the cleanup listener
*
*/
module.exports = (function() {
	const settings = {
		timeout: 5000,
		listener: function() {},
		cleanupEvent: 'cleanup',
		signals: ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'],
		processModule: process, // for unit tests
		catchListenerErrors: true, // for unit tests

	};

	function cleanupListener(cause) {
		settings.processModule.removeListener(settings.cleanupEvent, cleanupListener); // prevent duplicate calls
		let timer;
		let exitCode = 0;

		if (cause.code) {
			exitCode = cause.code;
		}
		else if (cause.error || cause.reason || cause.promise) {
			exitCode = 1;
		}

		function done() {
			clearTimeout(timer);
			reset(); // eslint-disable-line no-use-before-define
			settings.processModule.exit(exitCode);
		}

		timer = setTimeout(done, settings.timeout);

		if (settings.catchListenerErrors === true) {
			try {
				settings.listener(done, cause);
			}
			catch (err) {
				console.error('ERROR IN CLEANUP HANDLER: ', err); // eslint-disable-line no-console
				done();
			}
		}
		else {
			settings.listener(done, cause);
		}
	}

	function exitListener(code) {
		settings.processModule.emit(settings.cleanupEvent, { code });
	}

	function exceptionListener(exception) {
		settings.processModule.emit(settings.cleanupEvent, { exception });
	}

	function rejectionListener(reason, promise) {
		settings.processModule.emit(settings.cleanupEvent, { reason, promise });
	}

	function signalListener(signal) {
		settings.processModule.emit(settings.cleanupEvent, { signal });
	}


	function set(name, value) {
		settings[name] = value;
	}

	function reset() {
		init({ _emitterMethod: 'removeListener', callReset: false }); // eslint-disable-line no-use-before-define
	}

	function init({ _emitterMethod = 'once', callReset = true } = {}) {
		if (callReset === true) {
			reset();
		}
		settings.processModule[_emitterMethod](settings.cleanupEvent, cleanupListener);
		settings.processModule[_emitterMethod]('exit', exitListener);
		settings.processModule[_emitterMethod]('uncaughtException', exceptionListener);
		settings.processModule[_emitterMethod]('unhandledRejection', rejectionListener);
		for (const signal of settings.signals) {
			settings.processModule[_emitterMethod](signal, signalListener);
		}
	}

	return { init, reset, set };
}());
