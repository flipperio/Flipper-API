const validatePostId = require('../_utils/validatePostId');

/**
* Resolve the postId param to a Post document and append it to "req.post".
* Returns a 404 error if a Post with that id does not exist or the id is invalid.
*/
module.exports = function(app, { httpError, Post, path = 'postId' } = {}) {
	function resolvePostId(req, res, next, id) {
		validatePostId(httpError, Post, id).then(function(post) {
			req.post = post;
			next();
		})
		.catch(function(httpErr) {
			next(httpErr);
		});
	}

	app.param(path, resolvePostId);
};
