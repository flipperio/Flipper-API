const mongoose = require('mongoose');

const starSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now, required: true },
	category: { type: String, required: true, trim: true, lowercase: true },
	parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },

});

function trimId(original, transformed) {
	transformed.id = original._id;
	delete transformed._id;
}

starSchema.set('toJSON', { transform: trimId, versionKey: true });
module.exports = mongoose.model('Star', starSchema);
