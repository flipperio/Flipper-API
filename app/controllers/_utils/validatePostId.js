const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

/**
* Check if a provided ObjectId is a valid ObjectId and if a Post with that id exists.
*
* Returns a promise that resolves with the Post mongoose document that corisponds with
* that id, or rejects with an httpError.js object if the id is invalid, dose not exist,
* or a db error has occurred.
*
*/
module.exports = function validatePostId(httpError, Post, id) {
	const notFoundResponse = httpError.build('notFound', { message: `Could not find post with id ${id}` });

	if (ObjectId.isValid(id) === false) {
		return Promise.reject(notFoundResponse);
	}

	return Post.findById(id).exec().then(
		function(post) {
			if (!post) {
				return Promise.reject(notFoundResponse);
			}
			return post;
		},
		function(queryErr) {
			return Promise.reject(httpError.build('internal', { source: 'DATABASE', errorObject: queryErr }));
		},
	);
};
