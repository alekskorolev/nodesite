exports.create = function (mongoose) {
	var valbumsSchema = mongoose.Schema({
		name: String,
		description: String,
		created: Date,
		user: String,
		face: String,
		enable: {type: Boolean, default: true},
		type: {type: String, default: 'video'}
	});
	var Valbums = mongoose.model('Valbums', valbumsSchema);
	return Valbums;
};

