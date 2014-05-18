var helpers = require('../lib/helpers');
exports.create = function (mongoose) {
	var dictsSchema = mongoose.Schema({
		dict: {type: String, required: true},
		title:  {type: String, required: true,unique: true},
		enable: {type: Boolean }
	});
	dictsSchema.set('redisCache', true);
	dictsSchema.set('expires', 1800);
	var Dicts = mongoose.model('Dicts', dictsSchema);
	return Dicts;
};

