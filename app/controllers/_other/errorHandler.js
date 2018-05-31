const circularJson = require('circular-json');

module.exports = function(app, { httpError, handler, path = '*' } = {}) {
	function handleHttpError(err, req, res, next) {
		if (!err.payload) {
			return next(err);
		}

		const defaultStatus = 400;
		const status = err.internal.status || defaultStatus;
		if (process.env.NODE_ENV !== 'production') {
			err.payload.meta.request = JSON.parse(circularJson.stringify(req));
		}

		res.status(status).json(err.payload);

		if (status === 500 || err.internal.errorObject || err.payload.error === 'Internal') {
			handler.handle(err.internal.errorObject, { type: 'API', subType: req.url });
		}
	}

	function handleBodyParser(err, req, res, next) {
		if (!err.status || !err.body || !err.type) {
			return next(err);
		}

		const message = err.expose ? err.message : undefined;
		const httpErr = httpError.build('query', { message, status: err.status });
		if (process.env.NODE_ENV !== 'production') {
			httpErr.payload.meta.request = JSON.parse(circularJson.stringify(req));
		}

		res.status(httpErr.internal.status).send(httpErr.payload);
	}

	// eslint-disable-next-line no-unused-vars
	function fallback(err, req, res, next) {
		const httpErr = httpError.build('internal', { source: 'UNKNOWN' });
		if (process.env.NODE_ENV !== 'production') {
			httpErr.payload.meta.request = JSON.parse(circularJson.stringify(req));
		}

		handler.handle(err, { type: 'API', subType: req.originalUrl });
		res.status(httpErr.internal.status).send(httpErr.payload);
	}
	app.use(path, [handleHttpError, handleBodyParser, fallback]);
};
