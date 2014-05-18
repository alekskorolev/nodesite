// подключаем библиотеку вспомогательных методов
var helpers = require('../lib/helpers'), 
regexp = require('../public/js/regexp');

exports.create = function (mongoose) {
	// создание схемы
	var inviteSchema = mongoose.Schema({
		family:  {type: String, required:  [ true, 'Обязательное поле' ] },
		name: {type: String, required: [ true, 'Обязательное поле' ] },
		faname: {type: String, required: [ true, 'Обязательное поле' ] },
		work: {type: String, required: [ true, 'Обязательное поле' ] },
		email: {type: String, required: [ true, 'Обязательное поле' ]},
		why: {type: String, required: [ true, 'Обязательное поле' ] },
		create: { type: Date, default: Date.now },
		sent: { type: Date },
		request: { type: Date },
		code: {type: String, default: ""},
		url: Array,
		file: String,
		filetime: String,
		negative: { type: Boolean, default: false },
		movieOk: { type: Boolean, default: true }
	});
	 inviteSchema.set('redisCache', true);
	 inviteSchema.set('expires', 1800);
	var Invite = mongoose.model('Invite', inviteSchema);
	inviteSchema.pre('save', function(next) { 
		var that = this;
		console.log(this);
		if (!this.code) {
			this.code = helpers.generateUUID();
		}
		if (typeof this.url[0] == "string" ) {
			this.url.forEach(function(item, indx) { 
				console.log(item, indx);
				if (item) {
					that.url[indx] = JSON.parse(item); 	
					if (that.url[indx].url.indexOf("v=") != -1) that.url[indx].url = helpers.videoPars(that.url[indx].url);
				}
			});
			/*next();*/
			Invite.update({ email: this.email, code: {'$ne': null } }, {
			    code: null, 
			}, { multi: true } , function(err, numberAffected, raw) {
				  console.log('The number of updated documents was %d', numberAffected);
  					console.log('The raw response from Mongo was ', raw);
			   if( !err) { next(); }
			});
		} else {
			next();
		}
	});
	inviteSchema.post('save', function(doc) {
	  
	})
	inviteSchema.path('email').validate(function (value, respond) { 
		respond(regexp.mail.test(value));                                                                                          
	}, 'Недопустимый формат');
	inviteSchema.path('email').validate(function (value, respond) {
		var Users = app.get("models").users;
		var Invites = app.get("models").invite;
		var cont = Boolean;
		cont = true;
		Users.findOne({email: value}, function (err, user) {
			if (!err&&user&&!user.code) {
				respond(false);
			} else {
				Invites.findOne({email: value}, function (err, invite) {
					if (!err&&invite&&user&&!user.code) {
						respond(false);
					} else {
						respond(true);
					}
				});
			}
		});
	}, "Этот емайл уже зарегестрирован");
	inviteSchema.path('family').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	inviteSchema.path('name').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	inviteSchema.path('faname').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	inviteSchema.path('work').validate(function (value, respond) { 
		respond(regexp.fio.test(value));                                                                                          
	}, 'Недопустимый формат');
	inviteSchema.path('movieOk').validate( function (value, respond) {
		respond(value);
	}, "Приложите файл или ссылку");
	// inviteSchema.path('file').validate(function (value, respond) { 
	// 	if ( (!value  || value == "" ) && this.url.length < 1 ) {
	// 		respond(false);
	// 	} else {
	// 		respond(true);
	// 	}
	// }, 'Приложите файл или ссылку');
	return Invite;
};

