exports.create = function (mongoose) {
	var albumsSchema = mongoose.Schema({
		name: String,
		description: String,
		created: Date,
		user: String,
		face: String,
		enable: {type: Boolean, default: true},
		photos: []
	});
	var Albums = mongoose.model('Albums', albumsSchema);
	return Albums;
};

