var async = require('async');
//Индексный маршрут просмотра чужого профиля
exports.index = function(req, res){
	var Users = app.get("models").users;
	var Events = app.get('models').events;

	console.log("Вот что: ", req.query.id);

	if (req.query.id) {
		Users.findById(req.query.id, function (err, user) {
			if (err) {
				console.log("Ошибка поиска");
				res.send("Ошибка поиска");
			} else {
				if (!user) {
					console.log("Пользователь не найден");
					res.send("По данному запросу пользователь не найден");
				} else {
					//Рендерим страницу
					var access = false; //Имеет ли авторизованный пользователь доступ

					//Если у пользователя в графе видимость стоит "для всех" или ничего не стоит, то открываем
					//его профиль абсолютно для всех
					//или если авторизованный пользователь - админ
					if (user.visibleset=="all" || !user.visibleset || req.session.role=="admin") {
						console.log("1 условие выполнено");
						access = true;
					} else {
						//Если в настройках стоит "только мне"
						if (user.visibleset=="onlyUser") {
							//Если это user, то направляем его в свой профиль
							if (user._id==req.session.uid) {
								res.redirect("/profile");
							} else {
								access = false;
								console.log("доступа нет");
							}
						} else {
							if (user.visibleset=="editors") {
								if (req.session.role=="editor") {
									access = true;
								} else {
									access = false;
								}
							} else {
								if (user.visibleset=="authorized") {
									if (req.session.authorized) {
										access = true;
									} else {
										access = false;
									}
								} else {
									// Остается только один вариант - "Мне, редакторам или экспертам друзьям
									//Проверку на наличие дружеских связей сделаем потом
									//пока проверим на принадлежность к редакторам
									if (req.session.role=="editor") {
										access = true;
									} else {
										access = false;
									}
								}
							}
						}
					}

					if (access) {
						var Albums = app.get("models").albums;
						var Videos = app.get("models").videos;
						async.parallel({		    
						    albumsArray: function (callback){
						    	Albums.find({user: user._id, enable: true}, function (err, albums) {
						    		callback(err, albums);
						    	});
						    },
						    videos: function (callback) {
						    	Videos.find({user: user._id, enable: true, attached: {$exists: false}}, function (err, videos) {
						    		callback(err, videos);
						    	});
						    },
						    events: function (callback) {
						    	Events.find({user: user._id}, function (err, events) {
						    		callback(err, events);
						    	});
						    }
						}, function (err, results) {
							// Находим видео и фотоальбом пользователя
							console.log("Открываем профиль пользователя ", user._id);
							res.render("profileview/index", {
								page: {
									title: "Media Expert - "+user.name+" "+user.family,
								},
								user: req.session,
								profile: user,
								albums: results.albumsArray,
								videos: results.videos,
								events: results.events
							});
						});
					} else {
						//если доступа нет, направляем на соответствующую страницу
						res.render("profileview/noAccess", {
							page: {
								title: "Media Expert - нет доступа"
							},
							user: req.session
						});
					}
				}
			}
		});
	} else {
		console.log("Неверный параметр поиска");
		res.send("Неверный параметр поиска");
	}
}
