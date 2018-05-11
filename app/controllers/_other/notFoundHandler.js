module.exports = function(app, { httpError, path = '*' } = {}) {
	function handleNotFound(req, res, next) {
		return next(httpError.build('notFound'));
	}

	app.use(path, [handleNotFound]);
};
