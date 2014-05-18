exports.photoVal = function (photoId) {
	// Нам пришел индентификатор фотографии, находим ее
	var Photos = app.get("models").photos;

	Photos.findById(photoId, function (err, photo) {
		//Обрабатываем путь к файлу
		var arr = photo.path.split("/");
		var path = "/upload/"+arr[arr.length-1];
		console.log("path = ", path);
		//Путь для превьюшки
		arr[arr.length-1] = "prev"+arr[arr.length-1];
		prevPath = arr.join("/");
		console.log("Путь для превьюшки: ", prevPath);

		// Делаем превьюшку для фотографии
			easyimg.info(photo.path, function (err, img) {
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
						src: photo.path, dst: prevPath,
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

									//Сохраняем фотографию в базе
									var Photos = app.get("models").photos;
									var now = new Date();
									console.log("LABEL2: ", arr[arr.length-1]);
									var sphoto = new Photos({
										name: "Без названия",
										description: "Без описания",
										path: path,
										prevPath: "/upload/"+arr[arr.length-1],
										album: set_alb ? set_alb : "noalb",
										user: req.body.user_id,
										created: now
									});
									sphoto.save( function (err, photo) {
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
					console.log("Информация о фотографии не получена");
				}
			});
	});
};