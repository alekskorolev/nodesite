var fs = require('fs');
var thumbler = require("video-thumb");
var helper = require("../lib/helpers");

exports.index = function (req, res) {
	console.log("user: ", req.query.user);
	var Videos = app.get("models").videos;
	var Activities = app.get('models').activities;
	var Events = app.get('models').events;
	var Page = Number;
	var pageCount = 8;
	if (req.query.page) {
		Page = req.query.page;
	} else {
		Page = 1;
	}
	console.log("Главное видео: ", req.query.mainvid);

	if (req.query.user) {
		Videos.find({user: req.query.user, enable: true, attached: { $exists: false }}).skip( (Page-1)*pageCount).limit(pageCount).exec( function (err, videos) {
			if (!err && videos) {
				Videos.count({user: req.query.user, enable: true}, function (err, count) {
					res.render("valbum/index", {
						page: {
							title: "Media Expert - Video Albums"
						},
						user: req.session,
						mainvid: req.query.mainvid,
						videos: videos,
						user_id: req.query.user,
						count: count,
						pagecount: pageCount
					});
				});
			} else {
				console.log("Это error, либо не найден valbum");
				res.send("Ошибка поиска альбома в базе данных");
			}
		});		
	}
	if (req.query.activity) {
		Activities.findById(req.query.activity, function (err, activity) {
			console.log(activity);
			if (!err&&activity) {
				Videos.find({videoprev: {$in: activity.videos}, enable: true}).skip( (Page-1)*pageCount).limit(pageCount).exec( function (err, videos) {
					if (!err && videos) {
						Videos.count({videoprev: {$in: activity.videos}, enable: true}, function (err, count) {
							console.log(videos);
							req.query.user = 'activity';
							res.render("valbum/index", {
								page: {
									title: "Media Expert - Video Albums"
								},
								user: req.session,
								mainvid: req.query.mainvid,
								videos: videos,
								user_id: req.query.user,
								count: count,
								pagecount: pageCount,
								activity: req.query.activity
							});
						});
					} else {
						console.log("Это error, либо не найден valbum");
						res.send("Ошибка поиска альбома в базе данных");
					}
				});	
			} else {
				console.log(err);
				res.send(err);
			}
		})		
	}
	if (req.query.event) {
		Events.findById(req.query.event, function (err, event) {
			console.log(event);
			if (!err&&event) {
				Videos.find({videoprev: {$in: event.videos}, enable: true}).skip( (Page-1)*pageCount).limit(pageCount).exec( function (err, videos) {
					if (!err && videos) {
						Videos.count({videoprev: {$in: event.videos}, enable: true}, function (err, count) {
							console.log(videos);
							req.query.user = 'event';
							res.render("valbum/index", {
								page: {
									title: "Media Expert - Video Albums"
								},
								user: req.session,
								mainvid: req.query.mainvid,
								videos: videos,
								user_id: req.query.user,
								count: count,
								pagecount: pageCount,
								event: req.query.event
							});
						});
					} else {
						console.log("Это error, либо не найден valbum");
						res.send("Ошибка поиска альбома в базе данных");
					}
				});	
			} else {
				console.log(err);
				res.send(err);
			}
		})		
	}
};

exports.view = function (req, res) {
	console.log(req.query);
	var Valbums = app.get("models").valbums;
	var Page = Number;
	var pageCount = 8;
	if (req.query.page) {
		Page = req.query.page;
	} else {
		Page = 1;
	}
	Valbums.findById(req.query.id, function (err, valbum) {
		if (err) {
			res.render("valbum/errors", {
				page: {
					title: "Media Expert - Error Page"
				},
				error_msg: "Ошибка"
			});
		} else {
			if (!valbum) {
				res.render("valbum/errors", {
					page: {
						title: "Media Expert - Error Page"
					},
					error_msg: "Ошибка"
				});
			} else {
				// Ищем видео из альбома
				var Videos = app.get("models").videos;
				Videos.find({valbum: valbum._id, enable: true}).skip( (Page-1)*pageCount).limit(pageCount).exec(function (err, video) {
					if (err) {
						console.log("Ошибка");
					} else {
						Videos.count({valbum: valbum._id, enable: true}, function (err, count) {
							res.render("valbum/view", {
								page: {
									title: "Media Expert - Album View"
								},
								valb: valbum,
								user: req.session,
								video: video,
								page: Page,
								pagecount: pageCount
							});		
						});				
					}
				});
			}
		}
	});
};

exports.deletenosaved = function (req, res) {
	console.log("Удаляем видео");
	console.log("req.body.user_id: ", req.body.user_id);

	// Находим все файлы, чей ID равен req.body.user_id и saved = false
	var Videos = app.get("models").videos;
	Videos.find({saved: false, user: req.body.user_id}, function (err, videos) {
		if (!err&&(videos.length>0)) {
			console.log("ok");
			// Пробегаемся по массиву фотографий
			videos.forEach( function (video) {
				fs.unlink(video.path, function (err) {
					if (err) {
						console.log("Ошибка удаления файла: ", err);
					} else {
						console.log("Файл успешно удален");
						fs.unlink(video.vidprevsystem, function (err) {
							if (!err) console.log("Превью удалено");
							else console.log("Превью не далено, ошибка: ", err);
						});
					}
				});
				Videos.remove({path: video.path}, function (err) {
					if (err) {
						console.log("Ошибка удаления из базы: ", err);
						res.send({err: err, msg: "error"});
					} else {
						console.log("Удаление из базы успешно завершено");
						res.send({err: null, msg: "ok"});
					}
				});
			});
		} else {
			console.log("Мы не нашли ни одной фотографии такой в базе данных");
			res.send({err: "video not found", msg: "error"});
		}
	});
};

exports.deleteValb = function (req, res) {
	console.log("начинаем удаление альбома");
	var Valbums = app.get("models").valbums;
	Valbums.findById(req.body.id_valb, function (err, valbum) {
		if (err) {
			res.redirect("/");
		} else {
			console.log("label");
			if (valbum) {
				valbum.enable = false;
				valbum.save( function (err, sValbum) {
					console.log("label");
					if (err) {
						res.redirect("/");
					} else {
						console.log("Результат сохранение альбома: ", sValbum)
						res.redirect("/valbum?user="+valbum.user);
					}
				});
			} else {
				res.redirect("/");
			}
		}
	});	
};

exports.upload = function (req, res) {
	console.log(req.query);
	var Albums = app.get("models").albums;
	Albums.findById(req.query.album, function (err, album) {
		if (err) {
			console.log("Ошибка: ", err);
			res.send(err);
		} else {
			if (!album) {
				console.log("Альбом не найден");
				res.send("По данному запросу альбом не найден");
			} else {
				// Нашли альбом, генерируем страницу
				res.render("album/upload", {
					page: {
						title: "Media Expert - Upload Photo"
					},
					user: req.session,
					album_id: req.query.album
				});
			}
		}
	});
};

//Проверка фото и его подгрузка на страницу
exports.vUpload = function (req, res) {
	//Тут мы должны проверить файл, и если с ним все хорошо, то загрузить его, либо отправить сообщение об ошибке
	console.log("Есть контакт");
	console.log("req.body: ", req.body);
	console.log("req.files: ", req.files.file);

	var Videos = app.get("models").videos;
	var now = new Date();

	//Проверяем, какой тип данных загружен. Мы принимаем только видео
	if (/^video\/mp4/.test(req.files.file.type)) {
		// Загружено изображени, все хорошо
		// Сохраним изображение в базу данных и подгрузим его на страницу
			// Редактируем путь к файлу
			arr = req.files.file.path.split("/");
			path = "/upload/" + arr[arr.length-1];

		var video = new Videos ({
			name: "default",
			path: __dirname + "/../public/upload/" + arr[arr.length-1],
			from: "disk",
			viewpath: '/upload/' + arr[arr.length-1],

			user: req.body.user_id,
			saved: false,
			created: now
		});
		//Делаем для видео превьюшку
		thumbler.extract(req.files.file.path, req.files.file.path + '.jpg', '00:00:03', "200*200", function (err) {
			if (!err) {
				console.log("Превью готово");
				video.videoprev = path + '.jpg';
				video.vidprevsystem = __dirname + "/../public/upload/" + arr[arr.length-1] + ".jpg";
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
	} else {
		// Данный файл - не изображение вовсе, удаляем его и сообщаем об этом пользователю
			// Редактируем путь к файлу
			arr = req.files.video_upload.path.split("/");
			path = "/upload/" + arr[arr.length-1];
		fs.unlink(path, function () {
			console.log("Видео удалено");
			res.send({error: "type", msg: "Неверный формат файла"});
		});	
	}
}

exports.add_video = function ( req, res ) {
	console.log(req.body);
	var now = new Date();
	var Videos = app.get("models").videos;
	// В зависимости от параметра FROM либо находим видео в базе и изменяем его, либо создаем и сохраняем
	if (req.body.from=='disk') {
		console.log("Видео уже добавлено в базу, ищем его");
		Videos.findOne({path: req.body.path}, function (err, video) {
			if (err) {
				console.log("Ошибка базы данных");
				res.send({err: err, msg: "error"});
			} else {
				if (video) {
					video.name = req.body.name;
					video.description = req.body.description;
					video.saved = true;
					video.enable = true;
					video.created = now;

					video.save(function (err, svid) {
						if (err) {
							console.log("Ошибка сохранения видео");
							res.send({err: err, msg: "error"});
						} else {
							console.log("Видео сохранено: ", svid);
							res.send({err: null, msg: "Video saved!", video: svid});
						}
					});
				} else {
					console.log("Видео не найдено по полученному параметру PATH");
					res.send({err: "Video not found!", msg: "error"});
				}
			}
		});
	} else {
		if (req.body.from == 'internet') {
			// Парсим строку ютуба
			if (req.body.path.indexOf("youtube")+1) {
				arr = req.body.path.split("/");
				arr = arr[arr.length-1].split("?");
				arr = arr[arr.length-1].split("=");
				videoprev = "http://img.youtube.com/vi/"+arr[arr.length-1]+"/0.jpg";
			}
			// Парсим строку ютуба
			if (req.body.path.indexOf("youtube")+1) {
				arr = req.body.path.split("/");
				arr = arr[arr.length-1].split("?");
				arr = arr[arr.length-1].split("=");
				req.body.path = "//www.youtube.com/embed/" + arr[arr.length-1];
			}

			var video = new Videos ({
				name: req.body.name,
				description: req.body.description,
				path: req.body.path,
				saved: true,
				enable: true,
				user: req.body.user_id,
				created: now,
				from: req.body.from,
				videoprev: videoprev
			});
			video.save( function (err, svid) {
				if (!err) {
					console.log("Видео сохранено в базе!", svid);
					res.send({err: null, msg: "Видео успешно сохранено!", video: svid});
				} else {
					console.log("Ошибка сохранения видео в базе");
					res.send({err: err, msg: "error"});
				}
			});
		}
	}
}
exports.video_ajax = function (req, res) {
	console.log(req.body);
	//Ищем видео
	var Videos = app.get("models").videos;
	Videos.findById(req.body.id, function (err, video) {
		if (!err || video) {
			// в зависимости от типа запроса либо удаляем, либо сохраняем видео
			if (req.body.type=='save' || req.body.type=='app_save') {
				video.name = req.body.name;
				video.description = req.body.description;
				if (req.body.type=='save') {
					video.enable = true;
				}
			} else {
				if (req.body.type=='delete') {
					video.enable = false;
				} else {
					// Если тип операции не save и не delete, то просто нихера не делаем, передаем ошибку
					res.send({error: "Неправильный тип операции"});
				}
			}
			// Сохраняем фотографию
			video.save( function (err, sVideo) {
				if (err) {
					res.send({error: "Ошибка сохранения видео"});
				} else {
					console.log("Результат операции: ", sVideo);
					res.send({msg: "Операция с видео успешно завершена", sp: sVideo});
					if (req.body.type=='delete'&&sVideo.from=='disk') {
						fs.unlink(sVideo.path, function (err) {
							if (!err) console.log("Видео удалено");
							fs.unlink(sVideo.vidprevsystem, function (err) {
								if (!err) console.log("Превью удалено!"); 
								else console.log(err);
							});
						});	
					}
				}
			});
		} else {
			console.log("album.video_ajax: ошибка поиска видео по базе данных, либо видео не найдено");
			res.send({error: "Ошибка"});
		}
	});
};

exports.getVideo = function (req, res) {
	var Videos = app.get("models").videos;
	Videos.findById(req.body.id, function (err, video) {
		if (video && !err) {
			console.log('видео найдено');
			res.send({video: video});
		} else {
			console.log(err);
			res.send({error: "Ошибка поиска видео"});
		}
	});
};

exports.setAlbumFace = function (req, res) {
	console.log(req.body);
	var Albums = app.get("models").albums;
	Albums.findById(req.body.id_album, function (err, album) {
		if (!err && album) {
			album.face = req.body.path;
			album.save( function (err, sAlb) {
				if (!err) {
					res.send({msg: "success"});
				} else {
					res.send({msg: "error"});
				}
			});
		} else {
			res.send({msg: "error"});
		}
	});
}