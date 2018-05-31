module.exports = function(app, { httpError, path = '*' } = {}) {
	function handleNotFound(req, res, next) {
		const message = 'The requested endpoint does not exist. Check your URL or HTTP method';
		return next(httpError.build('notFound', { message }));
	}

	app.use(path, [handleNotFound]);
};
