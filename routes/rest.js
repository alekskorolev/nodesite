// Разделить бизнес логику для юзера и для админа
var thumbler = require('video-thumb');
var email = require("emailjs");
var ejs = require("ejs");
var fs = require('fs');
var valid = require('../public/js/validator');
var helpers = require('../lib/helpers');
var async = require('async');
var easyimg = require('easyimage');
var regexp = require('../public/js/regexp');
var mailaccount = {
	user:    "azure_7e2274093135ff316e8168db4abaa480@azure.com", 
	password:"8jfmceju", 
	host:    "smtp.sendgrid.net", 
	ssl:     false
}
/*
var ffmpeg = require('fluent-ffmpeg');*/
/*
 * REST routes.
 */

//Индексный	 маршрут REST интерфейса
exports.index = function(req, res){
	//TODO: реализовать методы REST
  res.send('Api Work!!!');
};

// Ajax проверка существования зароса инвайта с указанным email
exports.checkMailInvite = function (req, res) {
	var Invite = app.get('models').invite;
	Invite.findOne({email: req.body.email}, function (err, invite) {
		if (invite) {
			res.send('dublicate');
		} else if (err) {
			res.send('error');
		} else {
			res.send('ok');
		}
	});
};

//Отправка инвайта на запрос
//TODO Вынести метод отправки инвайта в отдельную функцию
//TODO Реализовать массовую отправку инвайтов по списку id
exports.invSend = function(req, res){
	var Invite = app.get('models').invite;
	var Users = app.get('models').users;
	var Profiles = app.get('models').profiles;
	// Поиск запроса инвайта по id
	Invite.findById(req.body.id, function (err, invite) {
		// Если нашли
		if (!err) {
			// Подготовка вспомогательных данных для параллельных операций
			// Генерация пароля
			var password = helpers.generatePASS();
			// Выполняем параллельно операции по созданию приглашения
			async.parallel({
				// Генерация email
				email: function(callback){
					//Если такой пользователь существует, то в емайл нужно отправить с существующим паролем
					Users.findOne({userid: invite.email}, function(err, user) {
						if (user) {
							console.log("Пользователь с таким емайлом уже существует в базе");
							console.log("Высылаем ему уже существующий пароль");
							password = user.newpass;
							if (!user.newpass) {
								password = "special_message";
							}
						}
					
						// Читаем файл шаблона письма
						fs.readFile(__dirname + '/../views/mailtempl/mail.ejs', 'utf8', function(err, data) {
							// Если без ошибок
						    if(!err) {
						    	// Определяем на каком url запущен сайт
						        var url = req.get('host');
						        // Генерим тест письма
						        var mailText = ejs.render(data, {
						        	invite: invite, 
						        	param: {
						        		url: url,
						        		pass: password
						        	}
						        });
						        // Передаем сгенеренное письмо в дальнейшую обработку
						        callback(null, mailText);
						    } else {
						    	// Если ошибка - передаем ошибку и нулевой результат
						    	callback(err,null);
						    }
						});
					});
			    },
			    // Создание записи пользователя, если пользователя еще не существует
			    // находим пользователя в базе, если код уже высылался
			    user: function(callback) {

			    	Users.findOne( {userid: invite.email}, function (err, user)
			    		{
			    			if (!err) {
			    				if (!user) {
				    				console.log("Создаем пользователя");
				   	 				// Создаем нового пользователя
						    		var user = new Users({ 
										userid: invite.email,  
										newpass: password,
										pass: "",
										role: 'expert',
										invid: invite._id,
										code: invite.code,
										email: invite.email,
										family:  invite.family,
										name: invite.name,
										faname: invite.faname,
										work: invite.work,
									});
									console.log(user);
									// Сохраняем нового пользователя
									user.save(function (err, newUser, numberAffected) {
										if (err) {
											// Если ошибка - возвращаем ошибку и нулевой результат
										  	console.log("Ошибка создания пользователя");
										  	console.log(err);
										  	callback(err, null);
										} else {
											// иначе возвращаем нулевой результат и модель созданного пользователя
											console.log("Пользователь создан", newUser);
											callback(null, newUser);
										}
									});
			    				} else {	
			    					callback(null, user);
			    					console.log("Пользователь уже создан " + user.email);
			    				}
			    			} else { 
			    				console.log("Ошибка, что я могу сказать.");
			    			}
			    		});
			    }
			},
				// Все параллельные запросы завершены
				function (err, results) { 
					// Если все ок, отправляем письмо
					if (!err) {
						// Создаем подключение
						var mailer  = email.server.connect(mailaccount);		
						// Отправлем письмо
						mailer.send({
			        		text: "Здравствуйте, пройдите по ссылке: http://"+invite.url+"/invite/accept?code=" + invite.code,
			        		from:    "Media Experts <mediaexpertmail@gmail.com>", 
						   	to:      invite.family + " " + invite.name + " <" + invite.email + ">",
						   	subject: "Media Experts invite code confirmation",
						   	attachment: 
						      	[
							      	{data: results.email, alternative:true}
							   	]
						}, function(err, message) { 
							// Если ошибка, отправляем администратору сообщение об ошибке
							/*
							*	TODO: Инвайт остается в исходном состоянии но пользователь уже сохранен
							*		Необходимо реализовать в начале роута проверку на наличие пользователя
							*		И пересоздавать пользователя вместо создания нового с переотправкой сообщения
							*		С кодом
							*/
							if (err) {
								res.send('error send message');
								console.log(err);
							} else {
								// Если сообщение успешно отправлено, модифицируем инвайт (дата отправки)
								invite.sent = Date.now();
								invite.save(function (err, invite) {
									if (err) {
										// сообщаем результат изменения профайла и инвайта
										console.log(err);
										res.send('error save profile');
									} else {
										res.send('ok');
									}
								});										
							}
						});				
					} else {
						res.send(err);
					}
				}
			);
		} else {
			console.log('Ошибка поиска инвайта');
			res.send(err);
		}
	});
};
// Интерфейс авторизации по логину и паролю
exports.login = function (req, res) {
	console.log(req.body);
	var Users = app.get('models').users;
	Users.findOne({ userid: req.body.login }, function (err, user) {
		console.log(err, user);
		if (user) {
	        user.comparePassword(req.body.password, function(err, isMatch) {
	        	console.log(err, isMatch); 
	            if (err || !isMatch) { 
	            	res.send('error');
	            } else {
		            console.log(req.body.password, isMatch); 
		            app.get('authlib').login(req, user);
					res.send('authorized');
	            }
	        });

		} else {
			res.send('error');
		}
	});
};
// Интерфейс обнуления сессии
exports.logout = function (req, res) {
  req.session.role = undefined;
  req.session.authorized = false;
  	res.send('exit');
};
// Интерфейс отправки сообщения обратной связи
// TODO: Реализовать просмотр сообщений в админке
// TODO: Возможно реализовать отправку на email или sms админу
exports.feedback = function (req, res) {
	var errorList = {
			feedbackName: "",
			feedbackMail: "",
			feedbackMsg: "",
			empty: true
		};
	if ((errorList = valid.feedback(req.body)).empty) {
		var Feedbacks = app.get('models').feedbacks;
		var feedback = new Feedbacks({ 
			name: req.body.feedbackName, 
			email: req.body.feedbackMail, 
			msg: req.body.feedbackMsg  
		});
		feedback.save(function (err, feedback) {
			  if (err) // TODO handle the error
			  feetback.speak();
			  res.send(errorList);
			});

	} else {
		res.send(errorList);
	}
	
};
// Реализация метода асинхронной Ajax загрузки файла для инвайта
exports.invloader = function (req, res) {
	console.log(req.files)
	var filePath = req.files.file.path.split("/");
	req.session.videofile = filePath[filePath.length-1];
	thumbler.extract(req.files.file.path, req.files.file.path + '.jpg', '00:00:03', "640*360", function(){
		// Временно отключаем конвертацию видео, необходимо выносить в отдельный сервис
/*		var proc = new ffmpeg({ source: req.files.inviteVideo.path, timeout: 30000, })
			.addOption('-bufsize', '131072k')
		  .addOption('-f', 'webm')
		  .saveToFile(req.files.inviteVideo.path+'.webm', function(stdout, stderr) {
		    console.log('file has been converted succesfully', stdout, stderr);
		  });*/
		res.send({error: null, path: '/upload/' + req.session.videofile});
	});
};



// Предварительная загрузка файла для редактирования
exports.photoPreload = function (req, res) {
	console.log(req.files);
	var filePath = req.files.photo.path.split("/");
	req.session.prephoto = filePath[filePath.length-1];	
	req.session.prePath = req.files.photo.path;
	res.send({error: null, path: '/upload/' + req.session.prephoto});
/*	easyimg.resize({src:req.files.photo.path, dst:req.files.photo.path, width:64, height:64}, function(err, stdout, stderr) {
	    if (err) throw err;
	});*/
/*	res.send('ok');*/
};
//обрезка, ресайз и сохранение фото
exports.photoSave = function (req, res) {
	var Users = app.get('models').users;
	var area = req.body;
	console.log(area);
	var photo = req.session.prePath;
	console.log("photo: ", photo);
	easyimg.crop(
	    {
	        src:photo, dst:photo,
	        cropwidth:area.w, cropheight:area.h,
	        gravity:'NorthWest',
	        x:area.x, y:area.y
	    },
	    function(err, stdout, stderr) {
	        if (!err) {
	        	easyimg.resize(
		        	{
		        		src:photo, 
		        		dst:photo, 
		        		width:290, 
		        		height:291
		        	}, 
		    		function(err, stdout, stderr) {
					    if (!err) {
					    	Users.findOne({_id: req.session.uid}, function (err, user) {
					    		console.log(user)
					    		if (!err) {
					    			user.photo = '/upload/' + req.session.prephoto;
					    			user.save(function (err, user) {
					    				if(!err) {
					    					console.log("Фото успешно сохранено");
					    					res.send({error: null, path: user.photo});
					    				} else {
										   	res.send({error: "save error", path: null});
										}
								    })
					    		} else {
							    	res.send({error: "profile find error", path: null});
							    }
					    	});
					    } else {
					    	res.send({error: "resize error", path: null});
					    }
					}
				);
	        } else {
	        	console.log("crop error");
	        	res.send(err);
	        }
	    }
	);
};
exports.restorepass = function (req, res) {
	var data = req.body;
	console.log(data);
	// Проверяем, пришли-ли какие-либо данные
	if (data && data.login) {
		var Users = app.get('models').users;
		// Ищем профиль пользователя
		Users.findOne({ userid: data.login  }, function (err, user) {
			if (err || !user) {
				// если ошибка при поиске профиля или профиль не найден, сообщаем об ошибке
				res.send('error');
			} else {
				user.newpass = helpers.generatePASS();
				user.saveeditcode = helpers.generateUUID();
				user.save(function (err, newUser, numberAffected) {
					if (!err) {
						fs.readFile(__dirname + '/../views/mailtempl/setmail.ejs', 'utf8', function (err, data) {
						if (!err) {
							var mailtext = ejs.render(data, {
								msg: "Чтобы изменения вступили в силу, перейдите по следующей ссылке: <a href='http://"+req.get('host')+"/profile/restorepass?code="+newUser.saveeditcode+"'>http://"+req.get('host')+"/profile/restorepass?code="+newUser.saveeditcode+"</a> !"+" Ваш новый пароль: "+newUser.newpass,
								url: req.get('host')
							});
							var mailer  = email.server.connect(mailaccount);
							mailer.send({
								text: "Вам ответ от Media Expert",
								from:    "Media Experts <mediaexpertmail@gmail.com>", 
								to:      newUser.email,
								subject: "Ответ от Media Expert",
								attachment: 
									[
										{data: mailtext, alternative:true}
									]
								}, function (err, message) {
									if (err) {
										console.log("Письмо мы не отправили, к сожалению", message);
										console.log(err);
										res.send({msg: "Error"});
									} else {
										console.log("Письмо мы, однако, отправили, к счастью", err, message);
										res.send("ok");
									}	
								});
							} else {
								console.log("Ошибка чтения файла!");
								res.send({msg: "Не можем прочитать файл"});
							}
						});					
					} else {
						res.send('error')
						console.log("ERR");
					}
				});
			}
		});
	} else {
		req.send('not found');
		console.log("ERRf");
	}
}
// Интерфейс редактирования полей профиля
exports.profEdit = function (req, res) {
	var data = req.body;
	console.log(data);
	// Проверяем, пришли-ли какие-либо данные
	if (data) {
		var Users = app.get('models').users;
		// Ищем профиль авторизованного пользователя
		Users.findOne({ _id: req.session.uid  }, function (err, user) {
			if (err || !user) {
				// если ошибка при поиске профиля или профиль не найден, сообщаем об ошибке
				res.send('error');
			} else {
				// иначе изменяем профиль:
				//даты должны быть в формате месяц/день/год, изменяем формат
				var arr = data.profBday.split("/");
				var d = new Date(arr[1]+"/"+arr[0]+"/"+arr[2]);
				console.log("profBday: ", arr[1]+"/"+arr[0]+"/"+arr[2]);
				console.log("Date(profBday): ", d);


				if (data.urlVk&&(data.urlVk.indexOf("http://") == -1)&&(data.urlVk.indexOf("https://") == -1) ) {
					data.urlVk = "http://"+data.urlVk;
				}
				if (data.urlFacebook&&(data.urlFacebook.indexOf("http://") == -1)&&(data.urlFacebook.indexOf("https://") == -1)) {
					data.urlFacebook = "http://"+data.urlFacebook;
				}
				if (data.urlUser&&(data.urlUser.indexOf("http://") == -1)&&(data.urlUser.indexOf("https://") == -1)) {
					data.urlUser = "http://"+data.urlUser;
				}
				var ch = {
					family: data.profFam ? (user.family = data.profFam) : false, 
					name: data.profName ? (user.name = data.profName) : null,
					faname: data.profFName ? (user.faname = data.profFName) : false,
					work: data.profWork ? (user.work = data.profWork) : null,
					email: data.profEmail ? (data.profEmail) : null,
					password: data.profnewPass ? (data.profnewPass): null,
					passwordEncore: data.profnewPassEncore ? (data.profnewPassEncore) : null,
					phone: data.profPhone ? (user.phone = data.profPhone) : null,
					rating: data.profRating ? (user.rating = data.profRating) : null,
					adress: data.profAdress ? (user.adress = data.profAdress) : null,
					urlVk: data.urlVk ? (user.urlVk = data.urlVk) : (user.urlVk = null) ,
					urlFacebook: data.urlFacebook ? (user.urlFacebook = data.urlFacebook) : (user.urlFacebook = null ),
					urlUser: data.urlUser ? (user.urlUser = data.urlUser) : (user.urlUser = null),
					edu: data.profEdu ? (user.edu = data.profEdu) : null,
					addedu: data.profAddedu ? (user.addedu = data.profAddedu) : null,
					gender: data.profGender ? (user.gender = data.profGender) : null,
					bday: d ? (user.bday = d) : null,
					visibleSet: data.visibleSet ? (user.visibleset = data.visibleSet) : user.visibleset = [],
/*					eduname: data.profEduname ? (user.eduname = data.profEduname) : null,*/
					interest: data.profInterest ? (user.interest = data.profInterest) : user.interest = [],
					prof: data.profProf ? (user.prof = data.profProf) : user.prof = [],
					showtype: data.profShowtype ? (user.showtype = data.profShowtype) : user.showtype = [],
					showtheme: data.profShowtheme ? (user.showtheme = data.profShowtheme) : user.showtheme = [],
					lastemail: user.email
				}

				//Если изменен пароль или емайл
				console.log(" label: ", (ch.email)&&(ch.email!=user.email) || ch.password);
				if ( (ch.email)&&(ch.email!=user.email) || ch.password) {

					//Проверяем введенные данные на правильность
					console.log("bool: ", regexp.mail.test(ch.email));
					console.log("bool pass: ", ch.passwordEncore==ch.password)
					if ( (ch.passwordEncore==ch.password) && (regexp.mail.test(ch.email)) ) {
						//Сгенерируем и сохраним код для юзера
						user.newemail = ch.email;
						user.newpass = ch.password;
						user.saveeditcode = helpers.generateUUID();
						user.save(function (err, newUser, numberAffected) {
							// Если пользователь сохранен, то продолжаем генерацию письма, иначе возвращаем ошибку.
							if (!err) {

								fs.readFile(__dirname + '/../views/mailtempl/setmail.ejs', 'utf8', function(err, data) {
									if (!err) {
										var mailtext = ejs.render(data, {
											msg: "Добрый день! Чтобы изменения вступили в силу, перейдите по ссылке: http://" + req.get('host') + "/profile/saveempass?code=" + user.saveeditcode + " ! Обратите внимание, что после перехода по ссылке вы уже не сможете вернуть старые данные.",
											url: req.get('host')
										});
										var mailer  = email.server.connect(mailaccount);
										mailer.send({
											text: "Вам ответ от Media Expert",
											from:    "Media Experts <mediaexpertmail@gmail.com>", 
											to:      newUser.email,
											subject: "Ответ от Media Expert",
											attachment: 
												[
													{data: mailtext, alternative:true}
												]
										}, function (err, message) {
											if (err) {
												console.log("Письмо мы не отправили, к сожалению", message);
												console.log(err);
												res.send({msg: "Ошибка отправки письма"});
											} else {
												console.log("Письмо мы, однако, отправили, к счастью", err, message);
												res.send({msg: "Письмо отправлено"});
											}	
										});
									} else {
										console.log("Ошибка чтения файла!");
										res.send({msg: "Не можем прочитать файл"});
									}
								});				
							} else {
								console.log("Ошибка сохранения пользователя (rest.saveeditprofile");
								console.log(err);
								res.send({msg: "Ошибка сохранения в базу"});
							}
						});
					} else {
						user.newemail = null;
						user.newpass = null;
						console.log("Отправляем сообщение об ошибке назад на страницу");
						res.send({msg: "Ошибка отправки", error: "send error"})
					}
				}
				console.log(user.bday);
				user.save(function (err, saveProf, rowAff) {
					//console.log(saveProf.bday);
					console.log("Save user: ", saveProf);
					if (!saveProf) console.log("Если save user = undefined: ", err);
					res.send({error: err, ch: ch, user: user});
				});	
			}
		});
	} else {
		res.send({error: 'empty data'});
	}

};


// Отправка ответа (обратная связь)
exports.sendAnswer = function(req, res) {
	var answer = req.body;
	var error = "";
	if (answer) console.log(answer);

	//Генерация письма
	fs.readFile(__dirname + '/../views/mailtempl/feedbackAnswer.ejs', 'utf8', function(err, data) {
		if (req.body._id && !err) {
			var Feedback = app.get('models').feedbacks;
			 Feedback.findById(req.body._id, function (err, feedback) {
				if (feedback) {
					var mailtext = ejs.render(data, {
						name: answer.name,
						msg: answer.msg,
						feedback: feedback,
						url: req.get('host')
					});
					var mailer  = email.server.connect(mailaccount);
					mailer.send({
						text: "Вам ответ от Media Expert",
						from:    "Media Experts <mediaexpertmail@gmail.com>", 
						to:      answer.email,
						subject: "Ответ от Media Expert",
						attachment: 
							[
								{data: mailtext, alternative:true}
							]
					});
/*					res.render('admin/feedbackview', { 
					  	page: { 
					  		title: 'Media Expert - admin panel' 
					  	},
				    	user: req.session,
				    	feedback: feedback
					});	*/			
				} else {
					res.redirect('/admin/feedbacks');
				}

			});		
/*
*/	
		} else {
			error = "Ошибка чтение файла письма";
		}
	res.send({error: error});
	});			
};

exports.admindicts = function(req, res) {
	var data = req.body;

	// Удаление записи
	if (data.type == 'delete') {
		var Dicts = app.get("models").dicts;

		console.log(data.code);

		Dicts.findOne({_id: data.code}, function (err, dict) {
			if (!err&&dict) {
				console.log("Запись найдена, ошибок не обнаружено");
				dict.enable = false;
				dict.save( function (err, dictSave, rowAff) {
					if (!err) {
						console.log("Юзер сохранен");
						console.log(dictSave);
						res.send("Удаление успешно завершено");
					}
				});				
			} else {
				res.send(err);
			}
		})
	}

	// Создание записи
	if (data.type == 'add') {
		console.log(1);
		var Dicts = app.get("models").dicts;
		var dict = new Dicts({
			dict: data.code,
			title: data.title,
			enable: true
		});

		console.log(dict);
		dict.save(function (err, saveDict, rowAff) {
			if (!err) {
				res.send("Успешно!");
			} else {
				res.send("err");
			}
		});

		Dicts.findOne({title: data.title}, function (err, fdict) {
			if (fdict) {
				console.log("Такая запись в словарях уже есть");
				fdict.enable = true;
				fdict.save();
			}
		});
	}
};

exports.adminRedact = function (req, res) {
	var Users = app.get("models").users;
	console.log('Пытаемся сохранить пришедшие изменения: ', req.body);
	Users.findById(req.body.uid, function (err, user) {
		if (err) {
			console.log("Ошибка поиска пользователя");
			res.send(err);
		} else {
			if (user) {
				var arr = req.body.profBday.split("/");
				var d = new Date(arr[1]+"/"+arr[0]+"/"+arr[2]);
				user.role = req.body.role;
				user.name = req.body.profName;
				user.faname = req.body.profFName;
				user.family = req.body.profFam;
				user.phone = req.body.profPhone;
				user.adress = req.body.profAdress;
				user.rating = req.body.profRating;
				user.work = req.body.profWork;
				user.bday = d;
				user.edu = req.body.profEdu;
				user.addedu = req.body.profAddedu;
				user.urlUser = req.body.urlUser;
				user.urlVk = req.body.urlVk;
				user.urlFacebook = req.body.urlFacebook;
				user.save( function (err, sUser) {
					if (err) {
						console.log("Ошибка сохранения пользователя", err);
						res.send(err);
					} else {
						console.log("Сохраненный пользователь: ", sUser);
						res.send("Пользователь успешно сохранен");
					}
				});
			} else {
				console.log("Пользователь не найден");
				res.send("Пользователь не найден");
			}
		}
	});
};

exports.sendNegativeMessage = function (req, res) {
	console.log(req.body);
	var Invites = app.get("models").invite;
	Invites.findById(req.body.id, function (err, invite) {
		if (err) {
			console.log("Ошибка: ", err);
			res.send(err);
		} else {
			if (invite) {
				//Инвайт нашли, формируем письмо

				//Генерация письма
				fs.readFile(__dirname + '/../views/mailtempl/negativeMessage.ejs', 'utf8', function(err, data) {
					if (!err) {
						var mailtext = ejs.render(data, {
							text: req.body.msg,
							param: {
								url: req.get("host")
							},
							url: req.get("host")
						});
						var mailer  = email.server.connect(mailaccount);
						mailer.send({
							text: "Вам ответ от Media Expert",
							from:    "Media Experts <mediaexpertmail@gmail.com>", 
							to:      invite.email,
							subject: "Ответ от Media Expert",
							attachment: 
								[
									{data: mailtext, alternative:true}
								]
						}, function (err, message) {
							if (err) {
								console.log("Ошибка отправка письма", err);
								res.send(err);
							} else {
								// Письмо отправлено, изменяем инвайт
								var d = new Date();
								invite.negative = true;
								invite.sent = d;
								invite.save( function (err, sInvite) {
									if (err) {
										console.log("Ошибка сохранения инвайта", err);
										res.send(err)
									} else {
										console.log("Инвайт сохранен", sInvite);
										res.send("OK");
									}
								});
							}
						});
						res.send("Письмо отправлено!");
					} else {
						console.log("Ошибка чтения файла письма");
						res.send("Ошибка чтения файла письма");
					}
				});			
			} else {
				console.log("Инвайт не найден");
				res.send("Инвайт не найден");
			}
		}
	});
};

exports.createValbum = function (req, res) {
	var now = new Date();
	var Valbums = app.get("models").valbums;
 	var valbum = new Valbums ({
 		name: req.body.name,
 		description: req.body.description,
 		created: now,
 		user: req.session.uid,
 		type: "video",
 	})
 	console.log(req.body);

 	//Сохраняем альбом
 	valbum.save(function (err, sValbum) {
 		if (err) {
 			console.log("Ошибка создания альбома");
 			res.send({error: "Ошибка создания альбома"});
 		} else {
 			console.log("Созданный альбом: ", sValbum);
 			res.send({succ: "Альбом успешно создан"});
 		}
 	});
};