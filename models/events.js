exports.create = function (mongoose) {
	var evSchema = mongoose.Schema({
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
		photoface: String,
		user: String
	})
	evSchema.set('redisCache', true);
	evSchema.set('expires', 1800);
	var Events = mongoose.model('Events', evSchema);
	return Events;
};