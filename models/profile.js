/*
Модели профайлов пользователей.
TODO: Добавить методы валидации.
*/
exports.create = function (mongoose) {
	var profileSchema = mongoose.Schema({
		userid: {type: String, required: true, unique: true, index: true},
		photo: String,
		family:  String,
		name: String,
		faname: String,
		work: String,
		email: {type: String, required: true, unique: true, index: true},
		newmail: String,
		gender: String,
		age: Number,
		edu: String,
		phone: String,
		eduname: String,
		addedu: String,
		adress: String,
		interest: [],
		prof: [],
		showtype: [],
		showtheme: []
	});
/*	profileSchema.pre('save', function(next) { 
		                                                                                                                                                                         
	    next();                                                                                                                                                                     
	});*/
	var Profiles = mongoose.model('Profiles', profileSchema);
	return Profiles;
};