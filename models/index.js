var Invites = require('./invite');/*
var Nvites = require('./nvite');*/
var Users = require('./users');
var Feedbacks = require('./feedbacks');
var Profiles = require('./profile');
var Dictionaryes = require('./dict');
var Albums = require('./album');
var Valbums = require('./valbum');
var Photos = require('./photo');
var Videos = require('./video');
var Activity = require('./activity');
var Posts = require('./post');
var Events = require('./events.js');

//Сбор моделей в единую структуру
exports.create = function (mongoose) {
	return models = {
		invite: Invites.create(mongoose),/*
		nvite: Nvites.create(mongoose),*/
		users: Users.create(mongoose),
		feedbacks: Feedbacks.create(mongoose),
		profiles: Profiles.create(mongoose),
		dicts: Dictionaryes.create(mongoose),
		albums: Albums.create(mongoose),
		valbums: Valbums.create(mongoose),
		photos: Photos.create(mongoose),
		videos: Videos.create(mongoose),
		activities: Activity.create(mongoose),
		posts: Posts.create(mongoose),
		events: Events.create(mongoose)
	};
};