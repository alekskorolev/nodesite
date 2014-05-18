// подключаем библиотеку вспомогательных методов
var helpers = require('../lib/helpers'), 
regexp = require('../public/js/regexp');

exports.create = function (mongoose) {
	// создание схемы
	var nviteSchema = mongoose.Schema({
		family:  {type: String, required:  [ true, 'Обязательное поле' ] },
		name: {type: String, required: [ true, 'Обязательное поле' ] },
		faname: {type: String, required: [ true, 'Обязательное поле' ] },
		work: {type: String, required: [ true, 'Обязательное поле' ] },
		email: {type: String, required: [ true, 'Обязательное поле' ] },
		why: {type: String, required: [ true, 'Обязательное поле' ] },
		create: { type: Date, default: Date.now },
		sent: { type: Date },
		request: { type: Date },
		code: {type: String, default: helpers.generateUUID()},
		url: [],
		file: String,
		filetime: String
	});
	 nviteSchema.set('redisCache', true);
	 nviteSchema.set('expires', 1800);
	var Nvite = mongoose.model('Nvite', nviteSchema);
	nviteSchema.pre('save', function(next) { 
		var that = this;
		console.log(this);
		if (typeof this.url[0] == "string" ) {
			this.url.forEach(function(item, indx) { 
				console.log(item, indx);
				if (item) {
					that.url[indx] = JSON.parse(item); 	
					if (that.url[indx].url.indexOf("?v=") != -1) that.url[indx].url = helpers.videoPars(that.url[indx].url);
				}
			});
			/*next();*/
			Nvite.update({ email: this.email, code: {'$ne': "" } }, {
			    code: '', 
			}, { multi: true } , function(err, numberAffected, raw) {
				  console.log('The number of updated documents was %d', numberAffected);
  					console.log('The raw response from Mongo was ', raw);
			   if( !err) { next(); }
			});
		} else {
			next();
		}
	});
	nviteSchema.post('save', function(doc) {
	  
	})
	nviteSchema.path('email').validate(function (value, respond) { 
		respond(regexp.mail.test(value));                                                                                          
	}, 'Недопустимый формат');
	nviteSchema.path('family').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	nviteSchema.path('name').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	nviteSchema.path('faname').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	nviteSchema.path('work').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	nviteSchema.path('file').validate(function (value, respond) { 
		if ( (!value  || value == "" ) && this.url.length < 1 ) {
			respond(false);
		} else {
			respond(true);
		}
	}, 'Приложите файл или ссылку');
	return Nvite;
};

