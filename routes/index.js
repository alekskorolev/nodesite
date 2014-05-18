
/*
 * GET home page.
 */

exports.index = function(req, res){
  var Users = app.get('models').users;
  var result = Users.find( { 
    role: { $in: ['expert'] }, 
    name: { $exists: true },
    photo: { $exists: true } 
  }).sort( { rating: -1 } ).limit(10);
  result.exec( function (err, users) {
    console.log(users, err);
    res.render('index', {
      page: {
        title: 'Media Expert'
      },
      user: req.session,
      users: users
    });
  })
};


//Технический маршрут установки сесии с ролью админа
exports.setadmin = function(req, res){
  req.session.role = 'admin';
  req.session.authorized = true;
  res.render('index', { 
    page: { 
      title: 'Set Admin' 
    },
    user: req.session
  })
};
//Технический маршрут установки сесии с ролью пользователя
exports.setuser = function(req, res){
  req.session.role = 'user';
  req.session.authorized = true;
  res.render('index', { 
    page: { 
      title: 'Set User' 
    },
    user: req.session
  })
};
//Технический маршрут удаления роли в сессии
exports.delauth = function(req, res){
  req.session.role = undefined;
  req.session.authorized = false;
  res.render('index', { 
    page: { 
      title: 'Clear Session' 
    },
    user: req.session
  })
};
//Технический маршрут удаления роли в сессии
exports.checksession = function(req, res){
  console.log(JSON.stringify(req.session));
  res.render('index', { 
    page: { 
      title: JSON.stringify(req.session) 
    },
    user: req.session
  })
};

/*
Маршрут страницы о сервисе
*/
exports.about = function(req, res){
  res.render('about', { 
  	page: { 
  		title: 'Media Expert - about' 
  	},
    user: req.session
  })
};

// Сообщение об ошибке в правах доступа
exports.accessError = function (req, res) {
  res.render('accessError', {
    page: {
      title: "Media Expert - Access Eror"
    },
    user: req.session
  });
};

exports.error = function (req, res) {
  res.render('error', {
    page: {
      title: 'Media Expert - Error'
    },
    user: req.session
  });
}




//Маршруты REST
exports.rest = require('./rest.js');


//Маршруты раздела каталогов
exports.catalog = require('./catalog.js');


//Маршруты раздела учебных программ
exports.lesson = require('./lesson.js');


//Маршруты раздела получения инвайтов
exports.invite = require('./invite.js');


//Маршруты админки
exports.admin = require('./admin.js');


//Маршруты раздела поиска
exports.search = require('./search.js');


//Маршруты профиля
exports.profile = require('./profile.js');

//Альбомы
exports.album = require('./album.js');

//Видео-альбомы
exports.valbum = require('./valbum.js');

// Мероприятия
exports.activity = require("./activity.js");

//Маршруты просмотра чужого профиля
exports.profileview = require('./profileview.js');

// Маршруты постов
exports.post = require('./post.js');

// Маршруты событий 
exports.events = require('./events.js');

// Маршрут загрузки фотографий/видео
exports.upload = require('./upload.js');