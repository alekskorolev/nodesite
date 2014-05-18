var async = require('async');

exports.list = function (req, res) {
	var Users = app.get('models').users;

	user_id = req.url.split('/');
	user_id = user_id[user_id.length-1];

	Users.findById(user_id, function (err, user) {
		if (!err&&user) {
			var Events = app.get('models').events;
			var cursor = Events.find({user: user_id}).sort({created: -1});
			cursor.exec(function (err, event) {
				res.render('events/list', {
					page: {
						title: 'Media Expert - Events'
					},
					events: event,
					user: req.session,
					req_user: user,
					current_user: req.session.userid === user.userid
				});		
			});
		} else {
			console.log(err, user);
			res.send('Error: ', err, ' User: ', user);
		}
	})
}

exports.show = function (req, res) {
	console.log('ok');
	id = req.url.split('/');
	id = id[id.length-1];

	var Events = app.get('models').events;
	Events.findById(id, function(err, event) {
		if (!err) {
			res.render('events/show', {
				page: {
					title: 'Media Expert - Event'
				},
				user: req.session,
				event: event,
				edit: false,
				current_user: req.session.uid == event.user
			})
		} else {
			console.log(err);
			res.send(err);
		}
	})
}

exports.create = function (req, res) {
	var Events = app.get('models').events;
	var ev = new Events({
		name: req.body.name,
		description: req.body.description,
		user: req.session.uid,
		videos: req.session.eventvideoload? req.session.eventvideoload : [],
		photos: req.session.eventphotoload? req.session.eventphotoload : []
	})
	req.session.eventphotoload = [];
	req.session.eventvideoload = [];
	
	ev.save(function (err, sEv) {
		if (!err) {
			console.log(sEv);
			res.redirect('/event/'+sEv._id);
			if (req.session.eventvideoload&&req.session.eventvideoload[0]) {
				console.log('ok');
				req.session.eventvideoload.forEach( function (video) {
					console.log('ok2');
					var Videos = app.get('models').videos;
					Videos.findOne({viewpath: video}, function (err, fVid) {
						console.log(fVid);
						fVid.attached_id = sEv._id;
						fVid.save();
					})
				})
			}
			console.log('1');
			if (req.session.eventphotoload&&req.session.eventphotoload[0]) {
				console.log('2');
				req.session.eventphotoload.forEach( function (photo) {
					console.log('3');
					var Photos = app.get('models').photos;
					Photos.findOne({path: photo}, function (err, fPh) {
						console.log(fPh);
						fPh.attached_id = sEv._id;
						fPh.save();
					})
				})
			}
		}
	})

	console.log(req.body);
}

exports.delete = function (req, res) {
	id = req.url.split('/');
	id = id[id.length-1];

	var Events = app.get('models').events;
	Events.findById(id, function (err, event) {
		if (!err) {
			event.remove();
			res.redirect('/events/'+event.user);
		} else {
			console.log(err);
			res.send(err);
		}
	})
}

exports.edit = function (req, res) {
	id = req.params.id;
	console.log('edit event')

	var Events = app.get('models').events;
	Events.findById(id, function (err, event) {
		if (!err) {
			res.render('events/show', {
				page: {
					title: 'Media Expert - Edit event'
				},
				user: req.session,
				event: event,
				edit: true
			})
		}
	})
}

exports.edit_post = function (req, res) {
	id = req.params.id;
	var Events = app.get('models').events;
	Events.findById(id, function (err, event) {
		event.name = req.body.name;
		event.description = req.body.description;
		event.save();
		res.redirect('/event/'+id);
	})
}