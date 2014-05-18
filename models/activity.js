exports.create = function (mongoose) {
	var actsSchema = mongoose.Schema({
		name: String,
		description: String,
		created: {type: Date, default: Date.now},
		place: String,
		price: String,
		start: Date,
		timestart: String,
		members: [],
		comments: [],
		photos: [],
		videos: [],
		photoface: String
	})
	actsSchema.set('redisCache', true);
	actsSchema.set('expires', 1800);
	var Activities = mongoose.model('Activities', actsSchema);
	return Activities;
};