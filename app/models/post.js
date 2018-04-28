const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	body: { type: String, required: true, trim: true },
	category: { type: String, required: true, trim: true, lowercase: true },
	timestamp: { type: Date, required: true, default: Date.now },
	parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
});

function trimId(original, transformed) {
	transformed.id = transformed._id;
	delete transformed._id;
}
postSchema.set('toObject', { transform: trimId, versionKey: false });

module.exports = mongoose.model('Post', postSchema);
