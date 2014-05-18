exports.create = function (mongoose) {
	var videosSchema = mongoose.Schema({
		name: String,
		description: String,
		path: String,
		enable: {type: Boolean, default: true},
		valbum: String,
		user: String,
		saved: Boolean,
		from: String,
		created: {type: Date, default: Date.now},
		videoprev: String,
		viewpath: String,
		vidprevsystem: String,
		activity: String,
		attached: String,
		attached_id: String
	});
	var Videos = mongoose.model('Videos', videosSchema);
	return Videos;
};