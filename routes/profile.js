var async = require('async');
exports.index = function (req, res) {
	var Users = app.get('models').users;
	var Dicts = app.get('models').dicts;
	var Albums = app.get("models").albums;
	var Videos = app.get("models").videos;
	console.log(req.session.uid);
	Users.findOne({ _id: req.session.uid  }, function (err, user) {
		if (err || !user) {
			// профиль не найден, по всей видимости юзер не авторизован
			res.redirect('/');
		} else {
			// запрашиваем словари для форм редактирования
			async.parallel({		    
				dictInterests: function(callback){
			    	Dicts.find({dict: "Interest", enable: true}).sort({title: 1}).exec( function (err, interests) {
						callback(err, interests); 
					});			
			    },
			    dictProfs: function(callback){
			    	Dicts.find({dict: "Prof", enable: true}).sort({title: 1}).exec( function (err, profs) {
						callback(err, profs); 
					});			
			    },
			    dictShowtypes: function(callback){
			    	Dicts.find({dict: "Showtype", enable: true}).sort({title: 1}).exec( function (err, showtypes) {
						callback(err, showtypes); 
					});			
			    },
			    dictShowthemes: function(callback){
			    	Dicts.find({dict: "Showtheme", enable: true}).sort({title: 1}).exec( function (err, showthemes) {
						callback(err, showthemes); 
					});			
			    },
			    // Фотачки видюшки
			    albumsArray: function (callback){
			    	Albums.find({user: user._id, enable: true}, function (err, albums) {
			    		callback(err, albums);
			    	});
			    },
			    videosArray: function (callback) {
			    	Videos.find({user: user._id, enable: true, attached: {$exists: false}}, function (err, videos) {
			    		callback(err, videos);
			    	});
			    },
			    // Евенты или как их там
			    events: function (callback) {
			    	var Events = app.get('models').events;
			    	var cursor = Events.find({user: req.session.uid}).sort({created: -1}).limit(3);
			    	cursor.exec(function (err, events) {
			    		callback(err, events);
			    	});
			    }
			},
			function (err, results) {
				//console.log(err,results);
				console.log("user.bday: ", user.bday);
				if (err) {
					res.redirect('/');
				} else {
					
					res.render('profile/Profile', { 
				  		page: { 
				  			title: 'Media Expert - profile edit' 
				  		},
				    	user: req.session,
				    	profile: user,
				    	dicts: results,
				    	albums: results.albumsArray,
				    	videos: results.videosArray,
				    	events: results.events
				  	});	
				}
			});
		}
	});
}
exports.empasschanged = function (req, res) {
	res.render('profile/empasschanged', { 
		page: { 
			title: 'Media Expert - profile edit',
		},
		text: req.session.inf,
		user: req.session,
	});	
}
exports.authErr = function (req, res) {
	res.render('profile/authErr', { 
		page: { 
			title: 'Media Expert - profile edit',
		},
		user: req.session
	});	
}


//Сохранение логина и пароля, после перехода по ссылке
exports.saveempass = function (req, res) {
	//Получаем код
	var code = req.query.code;
	console.log(code + " [saveempass]" );
	var user = app.get('models').users;
	//Ищем юзера с таким кодом в поле saveeditcode
	user.findOne({saveeditcode: code}, function (err, user) {
		if (user) {
			if (req.session.authorized) {
				console.log(req.session.userid === user.userid);
				if (req.session.userid === user.userid) {
					console.log("Начинаем сохранение");
					var changed = { pass: !!user.newpass, mail: (user.newemail != user.newemail) };
					user.pass = user.newpass ? user.newpass : user.pass;
					user.email = user.newemail ? user.newemail : user.email;
					user.userid = user.newemail ? user.newemail : user.email;
					console.log(user.pass + " " + user.email);
					user.newpass = null;
					user.newemail = null;
					user.saveeditcode = null;
					//Сохраняем пользователя совсем
					user.save(function (err, saveUser, rowAff) {
						req.session.inf = "";
						if (!err) {
							console.log("Пользователь сохранен");
							res.render('profile/empasschanged', { 
								page: { 
									title: 'Media Expert - profile edit',
								},
								changed: changed,
								profile: user,  
								user: req.session,
							});
/*							req.session.inf = "Данные изменены.";
							res.redirect('/profile/empasschanged');*/
						} else {
							console.log("Пользователь не сохранен");
							console.log(err)
							res.redirect("/");
						}
					});
				} else {
					console.log(req.session.userid ,"==", user.userid);
					res.redirect("/");
					console.log("Один пользователь пытается использовать код другого");
				}
			} else {
				res.redirect("/profile/authErr");
			}
		} else {
			console.log("Пользователь с таким кодом не найден.");
			res.redirect("/");
		}
	});
}
exports.restorepass = function (req, res) {
	//Получаем код
	var code = req.query.code;
	console.log(code + " [saveempass]" );
	var user = app.get('models').users;
	//Ищем юзера с таким кодом в поле saveeditcode
	user.findOne({saveeditcode: code}, function (err, user) {
		if (user) {
			console.log("Начинаем сохранение");
			var changed = { pass: !!user.newpass };
			user.pass = user.newpass ? user.newpass : user.pass;
			user.newpass = null;
			user.saveeditcode = null;
			//Сохраняем пользователя совсем
			user.save(function (err, saveUser, rowAff) {
				if (!err) {
					console.log("Пользователь сохранен");
					res.render('profile/empasschanged', { 
						page: { 
							title: 'Media Expert - profile edit',
						},
						changed: changed,
						profile: user,  
						user: req.session,
					});
				} else {
					console.log("Пользователь не сохранен");
					console.log(err)
					res.redirect("/");
				}
			});
		} else {
			console.log("Пользователь с таким кодом не найден.");
			res.redirect("/");
		}
	});
}

