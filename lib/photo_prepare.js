var easyimg = require("easyimage");

module.exports = function (path, callback) {
	// path - путь к фотографии, которую надо обработать.
	// callback - функция, которая должна сработать после выполнения

	// Готовим путь для превьюхи
	var prevPath = path.split('/');
		prevPath[prevPath.length-1] = 'prev' + prevPath[prevPath.length-1];
		prevPath = prevPath.join('/');

	// Делаем превьюшку для фотографии
	easyimg.info(path, function (err, img) {
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
				src: path, dst: prevPath,
				width: w, height: h
			}, function (err, img) {
				if (err) {
					console.log("Ошибка изменения размера: ", err);
					callback(err, null);
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
							callback(err, null);
						} else {
							console.log("Конечные размеры изображения: "+imag.width+":"+imag.height);

							easyimg.resize({
								src: path, dst: path,
								width: 1024, height: 780}, function (err, img) {
									if (err) {
										console.log("Произошла ошибка чтения файла");
										callback(err, null);
									} else {
										console.log("Размер основного файла изменен: size"+img.width+":"+img.height+" sizeMb: "+img.size);
										callback(null, prevPath);
									}
							});
						}
					});
				}
			});
		} else {
			callback(err, null);
		}
	});
}