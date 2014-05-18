var async = require('async');
var ejs = require('ejs');
var fs = require('fs');

exports.create = function (req, res) {
	console.log(req.body);
	var Posts = app.get('models').posts;
	var post = new Posts(req.body);

	post.save( function (err, post) {
		if (err) {
			console.log('Ошибка создание поста', err);
			res.send({err: err});
		} else {
			console.log(post);
			res.send({msg: 'success', post: post});
		}
	})
}

exports.get = function (req, res) {
	var Posts = app.get('models').posts;
	var Users = app.get('models').users;
	req.body.render = true;

	console.log(req.body);
	if (req.body.attached&&req.body.attached_id) {
		var cursor = Posts.find({
			attached: req.body.attached,
			attached_id: req.body.attached_id,
			enable: true
		}).sort({
			created: -1
		});

		cursor.exec( function (err, posts) {
			if (!err) {
				var UserArray = [];
				var HTMLArray = [];
				async.each(posts, function (post, callback) {
					console.log(post);
					Users.findById(post.author, function (err, user) {
						UserArray.push(user);
						console.log(err, user);
						if (req.body.render) {
							console.log('РЕНДЕРРЕНДЕР АХА');
							fs.readFile('../views/posts/one_post.ejs', function (err, file) {
								if (file) {
									ejs.render(file, function (err, html) {
										HTMLArray.push(html);
										callback();
									})
								} else {
									callback();
								}
							})
						} else {
							callback();
						}
					});
				}, function (err, callback) {
						console.log(posts);
						res.send({msg: 'success', posts: posts, users: UserArray, htmls: HTMLArray});
				});
			} else {
				res.send({err: err});
			}
		});
	}
}

// exports.del = function (req, res) {
// 	var Posts = app.get('models').posts;
// 	var id = req.body.id;

// 	Posts.remove(id, function (err, ok))
// }