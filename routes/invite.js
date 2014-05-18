var valid = require('../public/js/validator');
var fs = require('fs');
var async = require('async');
/*
Роуты страниц инвайтов
*/
exports.index = function(req, res){
	var errorList = {
			inviteFam: "",
			inviteName: "",
			inviteFName: "",
			inviteWork: "",
			inviteEmail: "",
			inviteWhy: "",
			inviteVideo: "",
			inviteFile: "",
			empty: true
		};
	console.log("invite.index, req.body: ", req.body);
	if (req.method =="GET") {
				req.session.videofile = undefined;
	}
	if (req.method == "POST" && req.body /*&& (errorList = valid.invite(req.body, req.session.videofile)).empty*/) {
		// qwerty
		req.body.name = req.body.name.trim();
		req.body.faname = req.body.faname.trim();
		req.body.family = req.body.family.trim();
		req.body.work = req.body.work.trim();
		req.body.why = req.body.why.trim();

		console.log("1: ", req.body.justUrl);
		console.log("2: ", req.body.movieOk);
		console.log(!(req.body.justUrl || req.body.movieOk=='true'));
		if (!(req.body.justUrl || req.body.movieOk=='true')) {
			req.body.movieOk = false
		} else {
			req.body.movieOk = true
		}

		// Парсим УРЛ у JSON объект
		if (req.body.url) {
			if (req.body.url.splice) {
				var jsonurl = [];
				req.body.url.forEach(function (url) {
					jsonurl[jsonurl.length]=JSON.parse(url);
				});
			} else {
				jsonurl = [JSON.parse(req.body.url)];
			}
		} else {
			jsonurl = null;
		}
		console.log("JSON URL: ", jsonurl);

		// получаем модель инвайтов 
		var Invite = app.get('models').invite;
		// создаем объект из полученного запроса
		var invite = new Invite(req.body);
		// добавляем путь к файлу если он был ранее приложен
		invite.file = req.session.videofile ? ('/upload/' + req.session.videofile) : undefined;
		// сохраняем объект инвайта
		invite.save(function (err, invite) {
		  if (err) {
			  console.log(err, invite, req.body);
			  errorList.empty = false;
			  errorList.inviteEmail = "Email уже зарегистрирован.";
			  console.log(req.body);
			  console.log("------------------------------");
				res.render('invite/index', { 
				  	page: { 
				  		title: 'Media Expert - send invite' 
				  	},
				  	val: req.body,
				  	errorList: errorList,
				  	err: err.errors,
		    		user: req.session,
		    		urls: jsonurl
				});
				return;
			  
		  } else {
		  	req.session.videofile = undefined;
			res.render('invite/invitenotice', { 
			  	page: { 
			  		title: 'Media Expert - get invite' 
			  	},
	    	user: req.session,
	    	invite: invite,
	    	urls: null
			});		  	
		  }
		});

	} else {
		res.render('invite/index', { 
		  	page: { 
		  		title: 'Media Expert - send invite' 
		  	},
		  	val: {invite: req.body},
		  	err: {},
    		user: req.session,
    		urls: null
		});
	}
};

// Проверка кода и переход на редактирование профиля
exports.accept = function (req, res) {
	var code = req.query.code;
	console.log('зашли: ', req.query.code)
	async.parallel({
		// Проверяем наличия приглашения, оно должно быть не старше 7 дней и с действительным кодом
		invite: function (callback) {
			var Invite = app.get('models').invite;
			Invite.findOne({ code: code  }, function (err, invite) {
				// передаем инвайт и ошибку в каллбек
				console.log('инвайт: ', !!invite)
				callback(err, invite);
			});
		},
		// Проверяем наличие юзера с кодом, код одноразовый и если юзера с этим кодом нет, то код недействителен
		user: function (callback) {
			var Users = app.get('models').users;
			Users.findOne({ code: code  }, function (err, user) {
				// передаем юзера и ошибку в каллбек
				console.log('юзер: ', !!user)
				callback(err, user);
			});
		}
	}, function (err, results) {
		console.log('результаты первого цикла: ', err, results)
		// если юзер и ивайт найдены, авторизуем пользователя, отправляем ему на имейл письмо(??) 
		// затем обнуляем код ивайта у юзера и ставим дату активации у инвайта
		if (results.invite && results.user) {
			// Корректный переход по коду, авторизуем и работаем дальше
			async.parallel({
				// устанавливаем дату первого входа пользователя.
				invUp: function (callback) {
					var now = new Date();
					results.invite.request = now;
					results.invite.negative = false;
					results.invite.save(function (err, saveInv, rowAff) {
						console.log('сохранили инвайт: ', !!saveInv)
						callback(err, saveInv);
					});
				},
				// убираем код активации у записи юзера
				// Создаем для юзера пароль
				userUp: function (callback) {
					results.user.code = null;
					results.user.pass = results.user.newpass;
					results.user.newpass = null;
					results.user.save(function (err,saveUser, rowAff) {
						console.log('сохранили юзера: ', !!saveUser);
						console.log(results.user);
						callback(err,saveUser);
					})
				}
			}, function (err, results) {
				console.log('результаты второго цикла: ', err, results)
				if (!err && results.userUp) {
					//генерим страницу редактирования профиля
					// и авторизуем пользователя
					app.get('authlib').login(req, results.userUp);
					res.send('authorized');
					console.log('перевод на профиль')
					res.redirect('/profile?edit=1');
				} else {
					console.log('иди на инвайт')
					res.redirect('/invite');
				}
			});
		} else if (results.invite) {
			// пользователь по этому инвайту уже регился, пусть авторизуется или восстановит пароль
			// TODO: сделать перенаправление на форму восстановления пароля
			console.log('иди на страницу ошибки')
			res.redirect('/error');
		} else {
			// Такого кода не найдено, возможно пользователь ввел неверный код или перешел сюда по ошибке
			// пусть  заправшивает инвайт
			console.log('иди на инвайт совсем')
			res.redirect('/invite');
		}
	});
}

// Проверка кода и переход на редактирование профиля
exports.accept_old = function(req, res){

	

	 Invite.findOne({ sent: {$gte: now.setDate(now.getDate()-7) }, code: code  }, function (err, invite) {
	 	console.log(invite, errorList);
	 	var template = 'invite/index';
		if (invite) {
			template = 'invite/register';
		} else {
			invite: {};
			template = 'invite/index';
		}
		var Dicts = app.get('models').dicts;
		async.parallel({
		    dictInerests: function(callback){
		    	Dicts.findOne({code: "interest"}, function (err, interests) {
					callback(err, interests.content); 
				});			
		    },
		    dictProfs: function(callback){
		    	Dicts.findOne({code: "prof"}, function (err, profs) {
					callback(err, profs.content); 
				});			
		    },
		    dictShowtypes: function(callback){
		    	Dicts.findOne({code: "showtype"}, function (err, showtypes) {
					callback(err, showtypes.content); 
				});			
		    },
		},
		function (err, results) {
			//console.log(err,results);
			res.render(template, { 
			  	page: { 
			  		title: 'Media Expert - register' 
			  	},
			  	errorList: errorList,
				user: req.session,
				val: invite || invitet,
				dicts: results
			});
		}
		);

	});

};

exports.register = function(req, res){
	console.log(req.body);
	// Подключение моделей
	var Users = app.get('models').users;
	var Profiles = app.get('models').profiles;
	var Invites = app.get('models').invite;
	
	// Ищем инвайт по коду
	var now = new Date();
	if ((errorList = valid.register(req.body)).empty) {
		Invites.findOne({ sent: {$gte: now.setDate(now.getDate()-7) }, code: req.body.registerCode  }, function (err, invite) {
			//Если найден - сохраняем пользователя
			if (invite) {
				user = new Users({
					userid: req.body.registerMail,  
					pass: req.body.registerPass, 
					role: 'expert',
					invid: invite._id
				});
				user.save(function (err, user) {
				  if (err) {
					  console.log(err, user);
						res.render('invite/postregister', { 
						  	page: { 
						  		title: 'Media Expert - send invite' 
						  	},
						  	val: req.body,
						  	errorList: {Msg: 'Такой пользователь уже зарегистрирован или ошибка сохранения'},
				    		user: req.session
						});
						return;
					  
					  } else if (user) {
						  // Если пользователь сохранен корректно - создаем профиль
						  profile = new Profiles({
								userid: user._id,
								family:  invite.family,
								name: invite.name,
								faname: invite.faname,
								work: invite.work,
								email: req.body.registerMail,
								gender: req.body.registerGender,
								age: req.body.registerAge,
								edu: req.body.registerEdu,
								eduname: req.body.registerEduname,
								addedu: req.body.registerAddedu,
								adress: { region: req.body.registerRegion, City: req.body.registerCity, street: req.body.registerAdress},
								interest: req.body.registerInterest,
								prof: req.body.registerProf,
								showtype: req.body.registerShow 
						  });
						  profile.save(function(err, profile){
							  console.log(err, profile);
								res.render('invite/postregister', { 
								  	page: { 
								  		title: 'Media Expert - send invite' 
								  	},
								  	val: req.body,
								  	errorList: {Msg: 'Спасибо за регистрацию'},
						    		user: req.session
								});						  
						  });
					  }
				});
			} else {
				res.render('invite/postregister', { 
				  	page: { 
				  		title: 'Media Expert - send invite' 
				  	},
				  	val: req.body,
				  	errorList: {Msg: 'Неопознанная ошибка регистрации'},
		    		user: req.session
				});	
			};
		});
	} else {
		var Dicts = app.get('models').dicts;
		async.parallel({
		    dictInerests: function(callback){
		    	Dicts.findOne({code: "interest"}, function (err, interests) {
					callback(err, interests.content); 
				});			
		    },
		    dictProfs: function(callback){
		    	Dicts.findOne({code: "prof"}, function (err, profs) {
					callback(err, profs.content); 
				});			
		    },
		    dictShowtypes: function(callback){
		    	Dicts.findOne({code: "showtype"}, function (err, showtypes) {
					callback(err, showtypes.content); 
				});			
		    },
		},
		function (err, results) {
			//console.log(err,results);
			res.render('invite/register', { 
			  	page: { 
			  		title: 'Media Expert - register' 
			  	},
			  	errorList: errorList,
				user: req.session,
				val: req.body,
				dicts: results
			});
		}
		);	
	}
}

exports.accept_new = function (req, res) {
	
};