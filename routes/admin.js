/*
Роуты страниц админ панель
*/
var async = require('async');
var help = require('../lib/helpers');
var email = require("emailjs");
var fs = require('fs');
var ejs = require('ejs');
var mailaccount = {
	user:    "azure_7e2274093135ff316e8168db4abaa480@azure.com", 
	password:"8jfmceju", 
	host:    "smtp.sendgrid.net", 
	ssl:     false
}

// Вывод главной страницы админки, со сбором статистики по базе.
exports.index = function(req, res){
	var Invite = app.get('models').invite;
	var User = app.get('models').users;
	var Dicts = app.get('models').dicts;
	var Feedback = app.get('models').feedbacks;
	var now = new Date();
	// Асинхронный параллельный запрос статистики
	async.parallel({
		// Запрос статистики по сообщения обратной связи
		fbCount: function (callback) {
			Feedback.count({enable: true}, function (err, count) {
				callback(err, count);
			});
		},
		// Запрос статистики по инвайтам
		invCount: function(callback){
			Invite.count({ sent: {$exists: true}, request: {$exists: false}, code: {'$ne': null } }, function (err, count) {
				callback(err, count); 
			});			
	    },
	    //Количество инвайтов, которым отправлен отказ
	    invCountNeg: function(callback){
	    	Invite.count({negative: true}, function (err, count) {
	    		callback(err, count);
	    	});
	    },
	    invNewCount: function(callback){
	    	Invite.count( { sent: {$exists: false}, code: {'$ne': null } }, function (err, count) {
	    		callback(err, count);
	    	});
	    },
	    // Зарос статистики по пользователям
		userCount: function(callback){
			User.count({}, function (err, count) {
				callback(err, count); 
			});			
	    }
	},
	// После выполнения запросов - генерация страницы
		function (err, results) {
			//console.log(err,results);
			res.render('admin/index', { 
			  	page: { 
			  		title: 'Media Expert - admin panel' 
			  	},
		    	user: req.session,
		    	statistic: results,
			});
		}
	);
};
// Страница с выводом списка инвайтов, письмо которым уже выслано, но по которым еще не перешли
exports.invites = function(req, res){
	var Invite = app.get('models').invite;
	//TODO: Реализовать постраничный вывод инвайтов
	 Invite.find({ sent: {$exists: true }, request: {$exists: false}, code: {'$ne': null } }, function (err, invites) {
	 	/*console.log(invites);*/
		if (invites) {
		} else {
			var invites = {};
		}
		res.render('admin/invite', { 
		  	page: { 
		  		title: 'Media Expert - admin panel',
		  		submit: 'Выслать письмо еще раз',
		  		inviteType: 'Инвайты, приглашения по котором высланы'
		  	},
	    	user: req.session,
	    	invites: invites
		});
	});
		
};
// Страница с выводом списка инвайтов, письмо которым еще не выслано
exports.newinvites = function(req, res) {
	var Invite = app.get('models').invite;
	var now = new Date();
	//TODO: Реализовать постраничный вывод инвайтов
	 Invite.find({ sent: {$exists: false }, code: {'$ne': null } }, function (err, invites) {
	 	/*console.log(invites);*/
		if (invites) {
		} else {
			var invites = {};
		}
		res.render('admin/invite', { 
		  	page: { 
		  		title: 'Media Expert - admin panel',
		  		submit: 'Выслать письмо',
		  		inviteType: 'Новые инвайты, по которым не было ответа'

		  	},
	    	user: req.session,
	    	invites: invites
		});
	});
};
// Страница с выводом списка инвайтов, по которым выслан отказ
exports.neginvites = function(req, res) {
	var Invite = app.get('models').invite;
	//TODO: Реализовать постраничный вывод инвайтов
	 Invite.find({negative: true}, function (err, invites) {
	 	/*console.log(invites);*/
		if (invites) {
		} else {
			var invites = {};
		}
		res.render('admin/invite', { 
		  	page: { 
		  		title: 'Media Expert - admin panel',
		  		submit: 'Выслать письмо',
		  		inviteType: 'Инвайты, по которым выслан отказ'
		  	},
	    	user: req.session,
	    	invites: invites
		});
	});
}

// Просмотр единичного инвайта
exports.invite = function(req, res){
	console.log(req.query);
	if (req.query.invId) {
		var Invite = app.get('models').invite;
		var now = new Date();
		 Invite.findById(req.query.invId, function (err, invite) {
		 	console.log(invite);
			if (invite) {
				res.render('admin/inviteview', { 
				  	page: { 
				  		title: 'Media Expert - admin panel' 
				  	},
			    	user: req.session,
			    	invite: invite
				});				
			} else {
				res.redirect('/admin/invites');
			}

		});		
	} else {
		res.redirect('/admin/invites');
	}
};

// Список обращений по обратной связи
exports.feedbacks = function(req, res) {
	var Feedback = app.get('models').feedbacks;

	Feedback.find({enable: true}, function (err, feedbacks) {
		if (!feedbacks) {
			var feedbacks = {};
		}
		res.render('admin/feedback', {
			page: {
				title: "Media Expert - admin panel",
			},
			user: req.session,
			feedbacks: feedbacks
		});
	});
}

// Просмотр единичного обращения по обратной связи
exports.feedback = function(req, res){
	console.log(req.query);
	if (req.query.fbId) {
		var Feedback = app.get('models').feedbacks;
		 Feedback.findById(req.query.fbId, function (err, feedback) {
			if (feedback) {
				res.render('admin/feedbackview', { 
				  	page: { 
				  		title: 'Media Expert - admin panel' 
				  	},
			    	user: req.session,
			    	feedback: feedback
				});				
			} else {
				res.redirect('/admin/feedbacks');
			}

		});		
	} else {
		res.redirect('/admin/feedbacks');
	}
};

exports.dicts = function(req, res) {
	var Dicts = app.get("models").dicts;
	var type = req.query.type;

	 Dicts.find({dict: type, enable: true}).sort({title: 1}).exec( function (err, fresults) {
	 	if (fresults) {
			// После выполнения запросов - генерация страницы
			res.render("admin/dicts", {
				page: {
					title: "Media Expert - admin panel"
				},
				type: type,
				user: req.session,
				results: fresults
			});	 		
	 	} else {
	 		res.redirect("/");
	 	}
	});		
};

exports.negativeSend = function (req, res) {
	var Invites = app.get("models").invite;
	console.log(req.query.id);
	Invites.findById(req.query.id, function (err, invite) {
		if (err) {
			console.log("Ошибка 123123");
			res.send("Ошибка поиска инвайта");
		} else {
			if (invite) {
				console.log("инвайт найден, продолжаем работу");
				res.render("admin/negativeSend", {
					page: {
						title: "Media Expert - admin panel"
					},
					user: req.session,
					invite: invite
				});
			} else {
				console.log("Инвайт не найден");
				res.send("Инвайт не найден");
			}
		}
	});
};

exports.deleteFeedb = function (req, res) {
	var Feedbacks = app.get("models").feedbacks;
	console.log(req.query);

	Feedbacks.findById(req.query.id, function (err, feedback) {
		if (err) {
			res.send("Ошибка удаления");
		} else {
			if (feedback) {
				// Фидбэк найден, изменяем его и сохраняем
				feedback.enable = false;
				feedback.save( function (err, sFeedb) {
					if (err) {
						res.send("Ошибка удаления");
					} else {
						res.redirect("/admin/feedbacks");
					}
				});
			} else {
				res.send("Указанный идентификатор записи не существует");
			}
		}
	});
};

// Отправка инвайтов на любой емайл
exports.sendInvite = function (req, res) {
	if (req.route.method === 'get') {
		res.render('admin/sendInvite', {
			page: {
				title: 'Media Expert - Send invite on email adress'
			},
			user: req.session,
			text: null
		});
	}
	if (req.route.method=='post') {
		// Пришел аякс запрос на отправку письма
		/*
		 *    На сервер приходит только ЕМАЙЛ адрес. 
		 *    Задача: сгенерировать и отправить письмо этот адрес, 
		 *    создать пользователя в базе данных, чтобы по этому емайл адресу можно было
		 *    пользователя активировать
		 */

		password = help.generatePASS();
		code = help.generateUUID();

		async.parallel({
		 	invite: function (callback) {
		 		var Invites = app.get('models').invite;
		 		Invites.findOne({email: req.body.email}, function (err, invite) {
		 			callback(err, invite);
		 		});
		 	}
		}, function (err, result) {
		 	var invite = result.invite;
		 	var Users = app.get('models').users;
		 	// Инвайт найден, или не найден. 
		 	if (result.invite) {
		 		var user = new Users({
		 			email: req.body.email,
		 			role: 'expert',
		 			pass: password,
		 			invid: code,
		 			name: invite.name,
		 			family: invite.family,
		 			faname: invite.faname,
		 			work: invite.work,
		 			userid: req.body.email
		 		});
		 	} else {
		 		var user = new Users({
		 			email: req.body.email,
		 			role: 'expert',
		 			invid: code,
		 			pass: password,
		 			userid: req.body.email
		 		});
		 	}

		 	async.parallel({
		 		user: function (callback) {
		 			var Users = app.get('models').users;
		 			Users.findOne({email: req.body.email}, function (err, fuser) {
		 				if (err) {
		 					callback(err, null);
		 				} else {
		 					if (fuser) {
		 						fuser.pass = password;
		 						fuser.save( function (err, sfuser) {
		 							callback(err, sfuser);
		 						});
		 					} else {
		 						user.save( function (err, suser) {
		 							callback(err, suser);
		 						})
		 					}
		 				}
		 			});
		 		}
		 	}, function (err, result) {
			 		console.log(result.user);
			 		if (err) {
			 			console.log('Произошла ошибка при сохранении юзера: ', err);
			 			res.send('Произошла ошибка при сохранении юзера: ', err);
			 		} else {
			 			// Пользователь создан, удаляем инвайт, если он был
			 			if (invite) {
			 				var Invites = app.get('models').invite;
			 				Invites.remove({_id: invite._id}, function (err) {
			 					if (err) console.log(err); else console.log("Инвайт успешно удален");
			 				});
			 			}
						fs.readFile(__dirname + '/../views/mailtempl/sendinvite.ejs', 'utf8', function(err, data) {
							// Если без ошибок
							if(!err) {
								// Определяем на каком url запущен сайт
								var url = req.get('host');
								// Генерим тест письма
								var mailText = ejs.render(data, {
								    password: password,
								    url: url
								});
								// Отсылаем сгенеренное письмо
								var mailer  = email.server.connect(mailaccount);		
								// Отправлем письмо
								mailer.send({
					        		from:    "Media Experts <mediaexpertmail@gmail.com>", 
								   	to:      req.body.email,
								   	subject: "Media Experts | Invite",
								   	attachment: 
								      	[
									      	{data: mailText, alternative:true}
									   	]
								}, function (err, message) {
									if (!err) {
										console.log('Письмо отправлено!');
										res.render('admin/sendInvite', {
											page: {
												title: 'Admin'
											},
											user: req.session,
											text: 'Пользователь создан, письмо отправлено!'
										});
									} else {
										console.log('Ошибка отправки');
										res.render('admin/sendInvite', {
											page: {
												title: 'Admin'
											},
											user: req.session,
											text: 'Возникла ошибка при создании пользователя. Попробуйте еще раз.'
										});
									}
								});
							} else {
								// Если ошибка - передаем ошибку и нулевой результат
								console.log('Ошибка чтения письма');
								callback(err,null);
							}
						});
			 		}
		 	})
		});
	}
}

// МЕРОПРИЯТИЯ !!!
	exports.add_act = function (req, res) {
		if (req.query.name) {
			console.log("Запрос на добавление мероприятия: ", req.query);

			var Activities = app.get("models").activities;
			var Photos = app.get("models").photos;
			var Videos = app.get("models").videos;
			
			// Мероприятия создано из модели Activities
			var act = new Activities (req.query);

			async.parallel({
				photos: function (callback) {
					var arrphoto = [];
					Photos.find({activity: "true"}, function (err, photos) {
						photos.forEach( function (ph) {
							ph.activity = "";
							ph.save();
						})
						for (var i = 0; i<photos.length; i++) {
							arrphoto[i] = photos[i].path;
						}
						callback(err, arrphoto);
					});
				},
				videos: function (callback) {
					var arrvideo = [];
					Videos.find({activity: "true"}, function (err, videos) {
						videos.forEach( function (vd) {
							vd.activity = "";
							vd.save();
						});
						for (var i = 0; i<videos.length; i++) {
							arrvideo[i] = videos[i].viewpath;
						}
						callback(err, arrvideo);
					});
				}
			},
				function (err, results) {
					act.photos = results.photos;
					act.videos = results.videos;
					act.save(function (err, sAct) {
						console.log("Результаты работы с мероприятием: ", err, sAct);
						res.render('admin/add_act', {
							page: {
								title: "Media Expert - admin"
							},
							user: req.session,
							sAct: sAct,
							err: err
						})
					});
				});
		} else {
			res.render('admin/add_act', {
				page: {
					title: "Media Expert - admin"
				},
				user: req.session,
				sAct: null,
				err: null
			});	
		}
	}

	exports.act_list = function (req, res) {
		var Activities = app.get("models").activities;

		Activities.find({}, function (err, fAct) {
			res.render('admin/act_list', {
				page: {
					title: 'Media Expert'
				},
				user: req.session,
				acts: fAct
			});			
		});
	};

	exports.admin_update = function (req, res) {
		console.log(req.files);
		
		if (req.files.photos) {
			var file = req.files.photos;
			var arr = file.path.split("/");

			var path = "/upload/" + arr[arr.length-1];
			var Photos = app.get("models").photos;
			var photo = new Photos({
				path: path,
				activity: 'true'
			});

			photo.save( function (err, sPhoto) {
				console.log("Результат сохранения фотографии: ", err, sPhoto);
				res.send({err: err, photo: sPhoto});
			});
		} else {
			if (req.files.videos) {
				var file = req.files.videos;
				var arr = file.path.split("/");

				var path = "/upload/" + arr[arr.length-1];
				var Videos = app.get("models").videos;
				var video = new Videos({
					viewpath: path,
					activity: 'true'
				});

				video.save( function (err, sVid) {
					console.log("Результат сохранения ви: ", err, sVid);
					res.send({err: err, video: sVid});
				})
			}
		}
	};

	// СОЗДАНИЕ КЛОНОВ!!!! 

	exports.many_clone = function (req, res) {
		var Users = app.get('models').users;

		names = [
		'Игорь', 'Андрей', 'Сергей', 'Михаил', 'Тимур', 'Стас', 'Николай', 'Георгий', 'Константин',
		'Павел', 'Тарас', 'Леонид', 'Федор', 'Филипп', 'Евгений', 'Александр', 'Алексей', 'Яков', 
		'Дмитрий', 'Эд', 'Антон', 'Лев', 'Трофим', 'Роман,', 'Валерий', 'Петр', 'Авраам',
		'Тимофей', 'Виталий', 'Грегорий', 'Никита', 'Денис'
		];
		namesw = [
		'Анна', 'Марья', 'Людмила', 'Евгения', 'Елена', 'Екатерина', 'Любовь', 'Зинаида',
		'Тамара', 'Виктория', 'Анастасия', 'Надежда', 'Наталья', 'Карина', 'Елизавета', 'Рината', 
		'Злата', 'Алена', 'Марина', 'Татьяна', 'Александра', 'Олеся'
		];

		familiesw = [
		'Комарова', 'Фахитская', 'Денисова', 'Пушкина', 'Гаврилова', 'Самохина', 'Николаева',
		'Петрова', 'Андреева', 'Кириллова', 'Лилова', 'Марсина', 'Боянина', 'Кониновская',
		'Порошкова', 'Салунова', 'Зверева', 'Копытина', 'Железнякова', 'Тарасова', 'Никитина',
		'Малышева', 'Суворова', 'Калашникова'
		]

		families = [
		'Петров', 'Иванов', 'Сидоров', 'Прокопенко', 'Павлов', 'Денисов', 'Караев', 'Шумихин', 
		'Сталов', 'Нисталов', 'Константиновский', 'Пожарный', 'Акинфеев', 'Яшин',
		'Басков', 'Лужков', 'Путин', 'Медведев', 'Дзагоев', 'Базалов', 'Антипенко', 'Друзь',
		'Борисов', 'Калашников', 'Железняков', 'Батыев', 'Флуфский'
		]

		fanames = [
		'Андреевич', 'Сергеевич', 'Потапович', 'Кириллович', 'Федорович', 'Евгеньевич', 'Тимурович',
		'Семенович', 'Петрович', 'Дмитриевич', 'Витальевич', 'Павлович', 'Александрович', 'Алексеевич',
		'Константинович'
		]

		fanamesw = [
		'Андреевна', 'Сергеевна', 'Анатольевна', 'Потаповна', 'Петровна', 'Евгеньевна', 'Тимуровна',
		'Дмитриевна', 'Витальевна', 'Семеновна', 'Кирилловна', 'Федеровна', 'Александровна',
		'Алексеевна', 'Павловна', 'Романовна'
		]

		images = 25;
		imagesw = 20;
		var i = 11;

		taras = setInterval(function () {
			if (i==500) clearInterval(taras);
			i++;
			sex = Math.ceil( Math.random()*2 );

			name = sex==1? names[ Math.ceil(Math.random()*names.length)-1 ] : namesw[ Math.ceil(Math.random()*namesw.length)-1 ];
			family = sex==1? families[ Math.ceil(Math.random()*families.length)-1 ] : familiesw[ Math.ceil(Math.random()*familiesw.length)-1 ];
			fname = sex==1? fanames[Math.ceil(Math.random()*fanames.length)-1]  : fanamesw[Math.ceil(Math.random()*fanamesw.length)-1];
			photo = sex==1? '/images/'+(sex==1?'man' : 'woman') + Math.ceil(Math.random()*images) + '.png' : '/images/'+(sex==1?'man' : 'woman') + Math.ceil(Math.random()*imagesw) + '.png';
			// email = help.generatePASS()+'@'+help.generatePASS()+'.ru';
			email = 'mail'+i+'@mail.ru';
			user = new Users({
				photo: photo,
				userid: email,
				email: email,
				invid: email,
				name: name,
				family: family,
				faname: fname,
				rating: Math.ceil( Math.random()*5 ),
				role: 'expert',
				gender: sex==1? 'man' : 'woman',
				pass: 'qwe'
			})

			user.save( function (err, user) {
				console.log(err, user.name, user.gender);
			});

		}, 50);
	}