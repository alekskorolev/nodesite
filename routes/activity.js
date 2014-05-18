var easyimg = require("easyimage");
var thumbler = require("video-thumb");

exports.index = function (req, res) {
	var Activities = app.get('models').activities;
	var bool = false;

	if (req.query.year&&req.query.month&&req.query.day) {
		var queryDate = new Date(req.query.year, req.query.month, req.query.day);
		console.log(req.query.year, ' ', req.query.month, ' ', req.query.day);
		var finqueryDate = new Date(req.query.year, req.query.month, (parseInt(req.query.day)+1) );
		console.log(finqueryDate);
		    finqueryDate = finqueryDate - 1;
		    console.log(finqueryDate)
		    finqueryDate = new Date( finqueryDate );
		query = {
			start: {$gte: queryDate, $lte: finqueryDate},
		}
		bool = true;
	} else {
		var now = new Date();
		query = {
			start: {$gte: now}
		}
	}

	console.log('Поиск по запросу: ', query);
	var cursor = Activities.find(query).sort({start:1}).limit(10);

	cursor.exec(function (err, activities) {
		if (err) {
			console.log('Error activity: ', err);
			res.send(err);
		} else {
			res.render('activity/index', {
				page: {
					title: 'Media Expert - Activities'
				},
				user: req.session,
				acts: activities,
				bool: bool
			});
			activities.forEach(function (act) {
				console.log('i: ', act.start);
			})
		}
	});
}

// МАРШРУТЫ ДЛЯ ОБРАБОТКИ AJAX запросов
exports.getactsday = function (req, res) {
	console.log('Запрос на получение данных о мероприятиях: ', req.body.type)
	console.log(req.body);
	if (req.body.month>11) { req.body.month = 0; req.body.year++ }
	if (req.body.month<0) { req.body.month = 11; req.body.year-- }

	// Нам прислали год и месяц. Нам надо знать точную дату начала месяца и точную дату конца
	// Чтобы выбрать все события между началом и концом и вернуть браузеру, раз ему это так нужно

		if (req.body.type=='count' || req.body.type=='concret' ) {

			if (!req.body.day) {
				// Точная дата начала
					var start = new Date(req.body.year, req.body.month, 1 );
				// Точная дата конца
					req.body.month++;
					if (req.body.month>11) {
						req.body.month = 0;
						req.body.year++;
					}
					var finish = new Date(req.body.year, req.body.month, 1);
						finish = finish - 1;
						finish = new Date(finish);				
				} else {
					console.log(req.body.year, req.body.month, req.body.day);
					console.log(req.body.finyear, req.body.finmonth, req.body.finday);
					var start = new Date(req.body.year, req.body.month, req.body.day);
					var finish = new Date(req.body.finyear, req.body.finmonth, req.body.finday);
						finish = finish - 1;
						finish = new Date(finish);

					console.log('Начало: ', start, ': ', 'Конец: ', finish);
				}
		}

		// теперь мы имеем две даты. выберем из базы все мероприятия, у которых старт больше чем start и меньше чем finish
			var Activities = app.get("models").activities;
			var cursor = Activities.find( {start: {$gte: start, $lt: finish} } ).sort({start:1});
		cursor.exec({start: {$gte: start, $lt: finish} }, function (err, acts) {
			//console.log(start, finish, acts);

			// Мы достали все мероприятия на этот месяц, теперь упаковываем это в массивчик
			if (req.body.type=='count') {
				var results = [];
				for (var i = 0; i<acts.length; i++) {
					var d = new Date(acts[i].start);
					d = d.getDate();
					results[d] = true;
				}
			}
			if (req.body.type=='concret') {
				results = acts;
			}
			//console.log(results);
			res.send(results);
		});
}

exports.new = function (req, res) {
	res.render('activity/new', {
		page: {
			title: 'Media Expert - new activity'
		},
		user: req.session
	});
}

exports.create = function (req, res) {
	console.log(req.body);

	if (req.body.start) {
		req.body.start = req.body.start.split('.');
		req.body.start = req.body.start[1] +'.'+ req.body.start[0] +'.'+ req.body.start[2];		
	} else {
		req.body.start = null;
	}

	var Activities = app.get('models').activities;
	var activity = new Activities(req.body)

	if (req.session.actFaceFullPath) {
		shortPath = req.session.actFaceFullPath.split('/');
		shortPath = '/'+shortPath[shortPath.length-2]+'/'+shortPath[shortPath.length-1];
		activity.photoface = shortPath;		
	} else {
		activity.photoface = null;
	}
	
	activity.photos = req.session.photosInAct;
	req.session.photosInAct = null;
	activity.videos = req.session.videosInAct;
	req.session.videosInAct = null;

	activity.save( function (err, sact) {
		if (err) {
			res.send(err);
			console.log(err);
		} else {
			console.log(sact);
			res.send(sact);
		}
	})
}

exports.setFace = function (req, res) {
	console.log(req.body, req.files);
	// К нам пришел файл, мы должны его уменьшить до нужных размеров и отдать обратно для его 
	// приведения в квадратнаую форму

	req.session.actFaceFullPath = req.files.file.path
	shortPath = req.files.file.path.split('/');
	shortPath = '/'+shortPath[shortPath.length-2]+'/'+shortPath[shortPath.length-1];
	res.send(shortPath);
}

exports.cropFace = function (req, res) {
	var area = req.body;
	console.log(area);
	var photo = req.session.actFaceFullPath;
	console.log("photo: ", photo);
	easyimg.crop(
	    {
	        src:photo, dst:photo,
	        cropwidth:area.w, cropheight:area.h,
	        gravity:'NorthWest',
	        x:area.x, y:area.y
	    },
	    function (err, stdout, stderr) {
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
					    	console.log('Изображение успешно порезано');
							shortPath = req.session.actFaceFullPath.split('/');
							shortPath = '/'+shortPath[shortPath.length-2]+'/'+shortPath[shortPath.length-1];
					    	res.send({error: null, path: shortPath})
					    } else {
					    	console.log('Ошибка порезки изображения');
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
}

exports.getusers = function (req, res) {
	var Users = app.get('models').users;
	var cursor = Users.find({role: 'expert', name: {$exists: true}, family: {$exists: true} }).sort({rating: -1});

	cursor.exec( function (err, users) {
		console.log(err, users);
		res.send(users);
	});
}

exports.loadphoto = function (req, res) {
	console.log(req.files.file);

	var Photos = app.get('models').photos;

	//Обрабатываем путь к файлу
	var arr = req.files.file.path.split("/");
	var path = "/upload/"+arr[arr.length-1];
		console.log("path = ", path);
	//Путь для превьюшки
	arr[arr.length-1] = "prev"+arr[arr.length-1];
	prevPath = arr.join("/");
	console.log("Путь для превьюшки: ", prevPath);

	easyimg.info(req.files.file.path, function (err, img) {
		if (!err) {
			console.log(img);
			var w = img.width;
			var h = img.height;
			var maxW = 200;
			var maxH = 200;
			if (w>h) {
				k = h/maxH;
				h = maxH;
				w = w/k;
				console.log("LABEL: "+w+":"+h);
			} else {
				if (h>w) {
					k = w/maxW;
					w = maxW;
					h = h/k;
				} else {
					if (h=w) {
						w = maxW;
						h = maxH;
					}					
				}
			}

			easyimg.resize({
				src: req.files.file.path, dst: prevPath,
				width: w, height: h
			}, function (err, img) {
				if (err) {
					console.log("Ошибка изменения размера: ", err);
				} else {
					console.log("Размеры изображение после ресайза: ", img.width, ":", img.height);
					easyimg.crop({
						src: prevPath,
						dst: prevPath,
						cropwidth: maxW,
						cropheight: maxH,
						x: 0,
						y: 0
					}, function (err, imag) {
						if (err) {
							console.log("Ошибка обрезки фотографии: ", err);
						} else {
							console.log("Конечные размеры изображения: "+imag.width+":"+imag.height);

							var photo = new Photos({
								name: "Без названия",
								description: "Без описания",
								path: path,
								prevPath: "/upload/"+arr[arr.length-1],
								album: "noalb",
								user: req.body.user_id,
								activity: 'yes'
							});
							photo.save( function (err, photo) {
								if (err) {
									res.send({err: err});
								} else {
									if (!req.session.photosInAct) {
										console.log('noact');
										req.session.photosInAct = [];
									}
									console.log(req.session.photosInAct);
									req.session.photosInAct.push(photo.path);

									// req.session.photosInAct[req.sessions.photosInAct.length] = photo.path;
									// console.log(req.session.photosInAct);

									//Сохранили, отправили данные о ней
										console.log("Отправляем данные в браузер");

									// Изменим размеры фотографии, нам не нужны херовины 11780х8912
									// 1024х780 вполне хватит
									easyimg.resize({
										src: req.files.file.path, dst: req.files.file.path,
										width: 1024, height: 780}, function (err, img) {
											if (err) {
												console.log("Произошла ошибка чтения файла");
												res.send({err: "Ошибка чтения файла"+err})
											} else {
												console.log("Размер основного файла изменен: size"+img.width+":"+img.height+" sizeMb: "+img.size);
												res.send({err: null, photo: photo});
											}
									});
								}
							});
						}
					});
				}
			});
		} else {
			console.log("Ошибка чтения информации о файле: ", img);
		}
	});	

}

exports.loadvideo = function (req, res) {
	console.log(req.files.file);

	if (!req.session.videosInAct) req.session.videosInAct = [];
	console.log(req.session.videosInAct);

	var Videos = app.get("models").videos;
	var now = new Date();

	arr = req.files.file.path.split("/");
	path = "/upload/" + arr[arr.length-1];

	var video = new Videos ({
		name: "default",
		path: __dirname + "/../public/upload/" + arr[arr.length-1],
		from: "disk",
		viewpath: '/upload/' + arr[arr.length-1],

		user: req.session._id,
		saved: false,
		created: now,
		activity: 'true'
	});
	//Делаем для видео превьюшку
	thumbler.extract(req.files.file.path, req.files.file.path + '.jpg', '00:00:03', "200*200", function (err) {
		if (!err) {
			console.log("Превью готово");
			video.videoprev = path + '.jpg';
			video.vidprevsystem = __dirname + "/../public/upload/" + arr[arr.length-1] + ".jpg";

			req.session.videosInAct.push(video.videoprev);

			video.save( function (err, sVideo) {
				if (err) {
					res.send({error: "dbError", msg: "Ошибка сохранения файла"});
				} else {
					// Фото сохранено, подгружаем его
					console.log("Сохранненое видео: ", sVideo);
					res.send({error: null, msg: "Видео успешно добавлено", video: sVideo});
				}
			});
		} else {
			console.log("Невозможно создать превью");
			res.send({error: "savepreverror", msg: "Ошибка создания превью"});
		}
	});
}

exports.view = function (req, res) {
	console.log(req.url);
	// Парсим УРЛ и находим ID мероприятия, которое надо показать.
	var arr = req.url.split('/');
	console.log('id: ', arr[arr.length-1]);
	id = arr[arr.length-1];

	var Activities = app.get('models').activities;
	Activities.findById(id, function (err, act) {
		if (err) {
			console.log(err);
			res.send('Возникла ошибка.');
		} else {
			if (!act) {
				res.send('Мероприятие с таким id не существует');
			} else {
				res.render('activity/view', {
					page: {
						title: 'Media Expert - Activity'
					},
					user: req.session,
					act: act
				});
			}
		}
	})
};

exports.getuser = function (req, res) {
	console.log(req.body);
	var Users = app.get('models').users;
	if (req.body.id) {
		Users.findById(req.body.id, function (err, user) {
			if (!err&&user) {
				console.log(user);
				res.send({err: null, user: user});
			} else {
				res.send({err: 'not_found||error', user: null});
			}
		})
	} else {
		res.send({err: 'not_id', user: null});
	}
}

exports.include_member = function (req, res) {
	arr = req.body.activity.split('/');
	id = arr[arr.length-1];
	user_id = req.session.uid;

	var Activities = app.get('models').activities;
	var Users = app.get('models').users;
	Activities.findById(id, function (err, act) {
		if (!err&&act) {
			if (act.members.indexOf(user_id)+1) {
				res.send({msg: 'has'});
			} else {
				act.members.push(user_id);
				act.save( function (err, act) {
					if (!err) {
						Users.findById(user_id, function (err, user) {
							res.send({msg: 'success', user: user});
						});
					} else {
						res.send({msg: 'save_error'});
					}
				})
			}
		} else {
			res.send({msg: 'error'});
		}
	});
}

exports.outclude_member = function (req, res) {
	arr = req.body.activity.split('/');
	id = arr[arr.length-1];
	user_id = req.session.uid;

	var Activities = app.get('models').activities;
	Activities.findById(id, function (err, act) {
		if (!err&&act) {
			poz = act.members.indexOf(user_id);
			if (poz+1) {
				act.members.splice(poz, 1);
				act.save( function (err, act) {
					if (!err) {
						res.send({msg: 'success'});
					} else {
						res.send({msg: 'save_error'});
					}
				})
			} else {
				res.send({msg: 'has'});
			}
		} else {
			res.send({msg: 'error'});
		}
	});
}