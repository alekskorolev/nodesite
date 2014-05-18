exports.create = function (mongoose) {
	var photosSchema = mongoose.Schema({
		name: String,
		description: String,
		path: String,
		prevPath: String,
		enable: {type: Boolean, default: true},
		album: String,
		user: String,
		created: {type: Date, default: Date.now},
		activity: String,
		ev: String,
		attached: String,
		attached_id: String

	});
	var Photos = mongoose.model('Photos', photosSchema);
	return Photos;
};