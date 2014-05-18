exports.create = function (mongoose) {
	var postsSchema = mongoose.Schema({
		title: { type: String },
		content: { type: String },
		author: { type: String },
		created: { type: Date, default: Date.now },
		attached: { type: String },
		attached_id: { type: String },
		enable: { type: Boolean, default: true }
	});
	var Posts = mongoose.model('Posts', postsSchema);
	return Posts;
};

