var thumbler = require("video-thumb");

module.exports = function (req, res) {
	// Пишем функцию, которая позже будет доступна для загрузки
	// ВСЕХ фотографий и ВСЕХ видео
	console.log(req.files);
	var photo_prepare = require('../lib/photo_prepare.js');

	if (req.files.photo) {
		console.log('Пришли фотографии');

		// Проверяем, если req.files.photo - не массив
		// то делаем из него массив, т.к. мы работаем тут только с массивами
		if (!req.files.photo.splice) {
			req.files.photo = [ req.files.photo ];
		}

		req.files.photo.forEach( function (photo) {
			photo_prepare(photo.path, function (err, preview) {
				if (!err) {
					console.log(preview);
					
					base_path = photo.path.split('/');

					base_prpath = '/upload/prev' + base_path [ base_path.length-1];
					base_path = '/upload/' + base_path[ base_path.length -1 ];

					var Photos = app.get('models').photos;
					var phot = new Photos({
						name: 'default',
						description: 'defalut',
						path: base_path,
						prevPath: base_prpath,
						attached: req.body.attached,
						attached_id: 'no-attached',
						user: req.session.uid
					})

					if (!req.session.eventphotoload) {
						req.session.eventphotoload = [];
					}
					req.session.eventphotoload.push(base_prpath);

					phot.save( function (err, pho) {
						if (!err) {
							console.log('Фото в базе!', pho);
							res.send(pho);
						} else {
							console.log('Ошибка сохранения фотографии в базе', err);
							res.send(err);
						}
					})
				} else {
					console.log(err);
					res.send(err);
				}
			});
		})
	}

	if (req.files.video) {
		var Videos = app.get('models').videos;
		console.log('Пришли видеозаписи');
		// Проверяем, если req.files.video - не массив

		// то делаем из него массив, т.к. мы работаем тут только с массивами
		if (!req.files.video.splice) {
			req.files.video = [ req.files.video ];
		}

		req.files.video.forEach( function (pvideo) {
			arr = pvideo.path.split("/");
				path = "/upload/" + arr[arr.length-1];

			var video = new Videos ({
				name: "default",
				path: __dirname + "/../public/upload/" + arr[arr.length-1],
				from: "disk",
				viewpath: '/upload/' + arr[arr.length-1],
				user: req.session.uid,
				saved: false,
				attached: req.body.attached,
				attached_id: 'no-attached'
			});
			//Делаем для видео превьюшку
			thumbler.extract(video.path, video.path+ '.jpg', '00:00:03', "200*200", function (err) {
				if (!err) {
					console.log("Превью готово");
					video.videoprev = path + '.jpg';
					video.vidprevsystem = __dirname + "/../public/upload/" + arr[arr.length-1] + ".jpg";

					if (!req.session.eventvideoload) {
						req.session.eventvideoload = [];
					}
					req.session.eventvideoload.push(path+'.jpg');

					video.save( function (err, sVideo) {
						if (err) {
							res.send({error: "dbError", msg: "Ошибка сохранения файла"});
						} else {
							// Фото сохранено, подгружаем его
							console.log("Сохранненое видео: ", sVideo);
							res.send(sVideo);
						}
					});
				} else {
					console.log("Невозможно создать превью");
					res.send(err);
				}
			});
		})

	}
}