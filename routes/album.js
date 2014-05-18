var fs = require("fs");
var async = require("async");
var easyimg = require("easyimage");

exports.index = function (req, res) {
	//Сбор информации об альбомах пользователя
	var Albums = app.get("models").albums;
	var Page = Number;
	var pageCount = 5;
	if (req.query.page) {
		Page = req.query.page;
	} else {
		Page = 1;
	}
	Albums.find({user: req.query.user, enable: true}).sort({created: 1}).skip((Page-1)*pageCount).limit(pageCount).exec( function (err, album) {
		if (err) {
			res.render("album/errors", {
				page: {
					title: "Media Expert - Error Page"
				},
				error_msg: "Произошла ошибка при поиске"
			});
		} else {
			console.log(album);
			var Photos = app.get("models").photos;
			Photos.find({user: album._id}, function (err, photo) {
				if (!err) {
					Albums.count({user: req.query.user, enable: true}, function (err,count) {
						res.render("album/index", {
							page: {
								title: "Media Expert - Albums"
							},
							user: req.session,
							album: album,
							user_id: req.query.user,
							page: Page,
							pagecount: pageCount,
							count: count,
							photos: photo
						});
					});
				} else {
					res.render("album/errors", {
						page: {
							title: "Media Expert - Error Page"
						},
						error_msg: "Произошла ошибка"
					});
				}
			});
		}
	});
};

exports.savealb = function (req, res) {
	console.log("Сохранение альбома");
	console.log("req.body: ", req.body);

	var Albums = app.get("models").albums;
	Albums.findById(req.body.id, function (err, alb) {
		if (err) {
			console.log("Error: ", err);
			res.send({err: err, msg: "error"});
		} else {
			if (alb) {
				req.body.name = req.body.name ? alb.name = req.body.name : null;
				req.body.description = req.body.description ? alb.description = req.body.description: null;

				alb.save( function (err, sAlb) {
					if (err) {
						console.log("error save: ", err);
						res.send({err: err, msg: "save error"});
					} else {
						console.log("Альбом успешно сохранен");
						res.send({err: null, msg: "Альбом успешно сохранен", alb: sAlb})
					}
				});
			} else {
				console.log("Альбом не найден");
				res.send({err: "Albums not found", msg: "Альбом не найден"});
			}
		}
	});
}

exports.createAlb = function (req, res) {
	var now = new Date();
	var Albums = app.get("models").albums;
 	var album = new Albums ({
 		name: req.body.name,
 		description: req.body.description,
 		created: now,
 		user: req.body.user
 	});
 	console.log(req.body);



 	//Сохраняем альбом
 	// album.save(function (err, sAlbum) {
 	// 	if (err) {
 	// 		console.log("Ошибка создания альбома");
 	// 		res.send({error: "Ошибка создания альбома"});
 	// 	} else {
 	// 		// Альбом сохранен, добавляем добавленные фотки к этому альбому
 	// 		var Photos = app.get("models").photos;
	 // 		Photos.find({album: "noalb", user: sAlbum}, function (err, photos) {
 	// 			if (!err&&photos) {
 	// 				photos.forEach( function (ph) {
 	// 					ph.album = sAlbum._id;
 	// 					ph.save( function (err, sPhoto) {
 	// 						if (!err) {
 	// 							console.log("Фотография добавлена к альбому", sPhotos.album);
 	// 						} else {
 	// 							console.log("Ошибка добавления фотографии к альбому");
 	// 						}
 	// 					});
 	// 				});
 	// 			} else {
 	// 				console.log("Ошибка добавления фотографий к альбому");
 	// 			}
 	// 		});
 	// 		console.log("Созданный альбом: ", sAlbum);
 	// 		res.send({succ: "Альбом успешно создан"});
 	// 	}
 	// });

	// Выполняем параллельно сохранение альбома в базу данных
	// И находим все фотографии пользователя, которые не сохранены в альбом
	var Photos = app.get("models").photos;
	async.parallel({
		album: function (callback) {
			album.save( function (err, sAlbum) {
				callback(err, sAlbum);
			});
		},
		photos: function (callback) {
			Photos.find({album: "noalb", user: req.body.user}, function (err, photos) {
				callback(err, photos);
			});
		}
	}, function (err, results) {
		if (err) {
			res.send(err);
		} else {
			// Теперь всем найденным фотографиям устанавливаем альбом
			results.photos.forEach( function (ph) {
				ph.album = results.album._id;
				ph.save( function (err, sPh) {
					if (!err) console.log("foro saved"); else 
					console.log("error foto saved");
				});
			});
			// У альбома прописываем в массив эти фотки
				//Генерим массив path'ов
				var arr = [];
				for (var i=0; i<results.photos.length; i = i+1 ) {
					arr[i] = results.photos[i].prevPath;
				}
			results.album.photos = arr;
			results.album.save( function (err, sAlbum) {
				if (!err) console.log("arr alb saved"); else 
				console.log("error arr alb saved");
			});

			res.send("OK");
		}
	});
};

exports.photoInfo = function (req, res) {
	console.log(req.body);
	var Photos = app.get("models").photos;
	setTimeout( function () {
		if (req.body.path) {
			query = {
				path: req.body.path
			}
		}
		if (req.body.prevPath) {
			query = {
				prevPath: req.body.prevPath
			}
		}
		Photos.findOne(query, function (err, photo) {
			if (!err&&photo) {
				console.log(photo);
				res.send(photo);
			} else {
				res.send(err);
			}
		});
	}, 0);
};

exports.photoUpload = function (req, res) {
	console.log(req.files);

	//Обрабатываем путь к файлу
	var arr = req.files.file.path.split("/");
	var path = "/upload/"+arr[arr.length-1];
		console.log("path = ", path);
	//Путь для превьюшки
	arr[arr.length-1] = "prev"+arr[arr.length-1];
	prevPath = arr.join("/");
	console.log("Путь для превьюшки: ", prevPath);

	// Делаем превьюшку для фотографии
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

								//Если указан альбом, то редактируем альбом
								if (req.body.album) {
									var set_alb = req.body.album;
									var Albums = app.get("models").albums;
									Albums.findById(set_alb, function (err, album) {
										if (err) {
											console.log("Альбом не найден");
										} else {
											album.photos.push("/upload/"+arr[arr.length-1]);
											album.save(function (err, sAlbum) {
												if (err) {
													console.log("Ошибка добавления альбома");
												} else {
													console.log("Альбом сохранен");

													//Сохраняем фотографию в базе
													var Photos = app.get("models").photos;
													var now = new Date();
													console.log("LABEL2: ", arr[arr.length-1]);
													var photo = new Photos({
														name: "Без названия",
														description: "Без описания",
														path: path,
														prevPath: "/upload/"+arr[arr.length-1],
														album: set_alb ? set_alb : "noalb",
														user: req.body.user_id,
														created: now
													});
													photo.save( function (err, photo) {
														if (err) {
															res.send({err: err});
														} else {
															//Сохранили, отправили данные о ней
															console.log("Отправляем данные в браузер");

															// Изменим размеры фотографии, нам не нужны херовины 11780х8912
															// 1024х780 вполне хватит
															easyimg.resize({
																src: req.files.file.path, dst: req.files.file.path,
																width: 1024, height: 780}, function (err, img) {
																if (err) {
																	console.log("Произошла ошибка чтения файла");
																} else {
																	console.log("Размер основного файла изменен: size"+img.width+":"+img.height+" sizeMb: "+img.size);
																}
															});
															res.send({err: null, photo: photo});
														}
													});
												}
											});
										}
									});
								} else {
									// Если альбом не указан, находим фотку в базе и отправляем ее 
									//Сохраняем фотографию в базе
									var Photos = app.get("models").photos;
									var now = new Date();
									console.log("LABEL2: ", arr[arr.length-1]);
									var photo = new Photos({
										name: "Без названия",
										description: "Без описания",
										path: path,
										prevPath: "/upload/"+arr[arr.length-1],
										album: "noalb",
										user: req.body.user_id,
										created: now,
										activity: req.body.activity ? req.body.activity : 'false'
									});
									photo.save( function (err, photo) {
										if (err) {
											res.send({err: err});
										} else {
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
						}
					});
				}
			});
		} else {
			console.log("Ошибка чтения информации о файле: ", img);
		}
	});

};

exports.getalb = function (req, res) {
	//Получен запрос с клиента о выдаче информации об альбоме
	console.log("req.body: ", req.body);

	var Albums = app.get("models").albums;
	Albums.findById(req.body.id, function (err, album) {
		if (!err && album) {
			// Альбом найден, кидаем инфу по нему
			res.send({msg: "ok", alb: album});
		} else {
			// error database || album not find
			res.send({err: "Произошла ошибка в базе данных, либо не найден альбом с соответствующим ID"});
		}
	});
};

exports.view = function (req, res) {
	console.log(req.query);
	var Albums = app.get("models").albums;
	var Activities = app.get("models").activities;
	var Events = app.get('models').events;
	var Page = Number;
	var pageCount = 8;
	if (req.query.page) {
		Page = req.query.page;
	} else {
		Page = 1;
	}

	if (req.query.id) {
		Albums.findById(req.query.id, function (err, album) {
			if (err) {
				res.render("album/errors", {
					page: {
						title: "Media Expert - Error Page"
					},
					error_msg: "Ошибка"
				});
			} else {
				if (!album) {
					res.render("album/errors", {
						page: {
							title: "Media Expert - Error Page"
						},
						error_msg: "Ошибка"
					});
				} else {
					res.render("album/view", {
						page: {
							title: "Media Expert - Album View"
						},
						alb: album,
						user: req.session,
					});					
				}
			}
		});		
	}

	if (req.query.activity) {
		Activities.findById(req.query.activity, function (err, activity) {
			if (err) {
				res.render("album/errors", {
					page: {
						title: "Media Expert - Error Page"
					},
					error_msg: "Ошибка"
				});
			} else {
				if (!activity) {
					res.render("album/errors", {
						page: {
							title: "Media Expert - Error Page"
						},
						error_msg: "Ошибка"
					});
				} else {
					activity.user = 'activity';
					res.render("album/view", {
						page: {
							title: "Media Expert - Album View"
						},
						alb: activity,
						user: req.session,
					});					
				}
			}
		});				
	}

	if (req.query.event) {
		Events.findById(req.query.event, function (err, event) {
			if (err) {
				res.render("album/errors", {
					page: {
						title: "Media Expert - Error Page"
					},
					error_msg: "Ошибка"
				});
			} else {
				if (!event) {
					res.render("album/errors", {
						page: {
							title: "Media Expert - Error Page"
						},
						error_msg: "Ошибка"
					});
				} else {
					event.user = 'event';
					res.render("album/view", {
						page: {
							title: "Media Expert - Album View"
						},
						alb: event,
						user: req.session,
					});					
				}
			}
		});				
	}
};

exports.savephoto = function (req, res) {
	console.log("save photo");
	var Photos = app.get("models").photos;
	Photos.findOne({path: req.body.path}, function (err, photo) {
		console.log("Найденое фото", photo);
		if (!err&&photo) {
			photo.name = req.body.name;
			photo.description = req.body.description;
			photo.save( function (err, sPhoto) {
				if (!err) {
					console.log("ok", sPhoto);
					res.send({msg: "ok"});
				} else {
					res.send({err: err});
					console.log("photo not saved");
				}
			});
		} else {
			res.send({err: err});
		}
	});
};
exports.deleteNoAlb = function ( req, res ) {
	// Если пришел запрос на этот адрес, то мы должны удалить фотографии, альбом для которых 
	// еще не был создан
	var Photos = app.get("models").photos;
	Photos.find({album: "noalb"}, function (err, photos) {
		if (photos) {
			photos.forEach(function (ph) {
				//Имеем фото. Удаляем сначала его файл.
				fs.unlink(ph.path, function (err) {
					if (!err) {
						console.log("Изображение успешно удалено");
					} else {
						console.log("Ошибка удаления" ,err);
					}
				});	
				// Удаляем фото из базы данных
				Photos.remove({path: ph.path}, function (err) {
					if (!err) {
						console.log("Изображение из базы удалено");
					} else {
						console.log("Ошибка удаления изображения из базы", err);
					}
				});
			});
			console.log('asd');
		} else {
			console.log("Альбомы не найдены");
		}
	});
	res.send("OK");
};

exports.deleteAlb = function (req, res) {
	console.log("начинаем удаление альбома");
	var Albums = app.get("models").albums;
	Albums.findById(req.body.id_alb, function (err, album) {
		if (err) {
			res.redirect("/");
		} else {
			console.log("label");
			if (album) {
				album.enable = false;
				album.save( function (err, sUser) {
					console.log("label");
					if (err) {
						res.redirect("/");
					} else {
						console.log("Результат сохранение пользователя: ", sUser)
						res.redirect("/album?user="+album.user);
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
exports.PhotoControl = function (req, res) {
	//Тут мы должны проверить файл, и если с ним все хорошо, то загрузить его, либо отправить сообщение об ошибке
	console.log("Есть контакт");
	console.log("req.body: ", req.body);
	console.log("req.files: ", req.files);

	var Photos = app.get("models").photos;

	//Проверяем, какой тип данных загружен. Мы принимаем только сообщения
	if (/^image/.test(req.files.photo_upload.type)) {
		// Загружено изображени, все хорошо
		// Сохраним изображение в базу данных и подгрузим его на страницу
			// Редактируем путь к файлу
			arr = req.files.photo_upload.path.split("/");
			path = "/upload/" + arr[arr.length-1];

		var photo = new Photos ({
			name: "default",
			path: path
		});
		photo.save( function (err, sPhoto) {
			if (err) {
				res.send({error: "dbError", msg: "Ошибка сохранения файла"});
			} else {
				// Фото сохранено, подгружаем его
				console.log("Сохранненая фотография: ", sPhoto);
				res.send({error: null, msg: "Фото успешно добавлено", path: sPhoto.path});
			}
		});
	} else {
		// Данный файл - не изображение вовсе, удаляем его и сообщаем об этом пользователю
			// Редактируем путь к файлу
			arr = req.files.photo_upload.path.split("/");
			path = "/upload/" + arr[arr.length-1];
		fs.unlink(path, function () {
			console.log("Изображение удалено");
			res.send({error: "type", msg: "Неверный формат файла"});
		});	
	}
}

exports.photo_ajax = function (req, res) {
	console.log(req.body);
	//Ищем фотографию
	var Photos = app.get("models").photos;
	Photos.findOne({path: req.body.path}, function (err, photo) {
		if (!err && photo) {
			// Убираем\добавляем фотографию в массив альбома
			var Albums = app.get("models").albums;
			Albums.findById(photo.album ? photo.album : req.body.album_id, function (err, album) {
				if (!err && album) {
					if (req.body.type=='save') {
						album.photos.push(photo.path);
					} 
					if (req.body.type=='delete') {
						album.photos.splice(album.photos.indexOf(photo.prevPath), 1);
					}
					album.save( function (err, album) {
						console.log("err: ", err, " album: ", album);
					});
				}
			});

			// в зависимости от типа запроса либо удаляем, либо сохраняем фотографию
			if (req.body.type=='save' || req.body.type=='app_save') {
				photo.name = req.body.name;
				photo.description = req.body.description;
				if (req.body.type=='save') {
					photo.enable = true;
					photo.album = req.body.album_id;
					photo.user = req.body.user;
				}
			} else {
				if (req.body.type=='delete') {
					photo.enable = false;
				} else {
					// Если тип операции не save и не delete, то просто нихера не делаем, передаем ошибку
					res.send({error: "Неправильный тип операции"});
				}
			}
			// Сохраняем фотографию
			photo.save( function (err, sPhoto) {
				if (err) {
					res.send({error: "Ошибка сохранения фотографии"});
				} else {
					console.log("Результат операции: ", sPhoto);
					res.send({msg: "Операция с фотографией успешно завершена", sp: sPhoto});
					if (req.body.type=='delete') {
						fs.unlink(req.body.path, function () {
							console.log("Изображение удалено");
						});	
					}
				}
			});
		} else {
			console.log("album.photo_ajax: ошибка поиска фотографии по базе данных, либо фотография не найдена");
			res.send({error: "Ошибка"});
		}
	});
};

exports.getPhoto = function (req, res) {
	var Photos = app.get("models").photos;
	Photos.findById(req.body.id, function (err, photo) {
		if (photo && !err) {
			console.log('фото найдено');
			res.send({photo: photo});
		} else {
			console.log(err);
			res.send({error: "Ошибка поиска фотографии"});
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


// Этот запрос принимает массив, в котором хранятся пути к фотографиям
// На основе этого массива генерируется окно фотоальбома и сами фотографии

exports.show = function (req, res) {
	// Подключаем вспомогательный модуль рендеринга.
	var ejs = require('ejs');
	var fs = require('fs');

	// Читаем файл вьюшки
	fs.readFile(__dirname+'/../views/photo/show.ejs', 'utf-8', function (err, html) {
		if (err) console.log(err);
		html = ejs.render(html, {});
		res.send(html);
	})
}