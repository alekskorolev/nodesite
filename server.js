var express = require('express'),
  routes = require('./routes'),
  ejs = require('ejs'),
  email = require("emailjs"),
  i18n = require("i18n"),
  mongoose = require('mongoose'),
  models = require('./models').create(mongoose),
  helpers = require('./lib/helpers'),
  reCache = require("mongoose-redis-cache"),
  redis = require("redis").createClient(),
  Auth = require('./lib/auth');
  mongoose.connect('mongodb://localhost/mediaexp');
  reCache(mongoose);
  
  var os = require('os');
  console.log(os.type());

// Скрипты инициализации приложения
var initScript = require('./initscript').start({models: models});

//Конфигурация локализации

i18n.configure({
    locales:['ru'],
    directory: __dirname + '/locale',
    defaultLocale: 'ru',
});

//Конфигурация параметров аутентификации и регистрации:
//TODO: Вынести параметры регистрации/авторизации в отдельный модуль.
app = module.exports = express();

// Configuration
app.authHelper = Auth.init({app: app, express: express, dbUrl: "mongodb://localhost/mediaexp", expire: 120000});
app.configure(function(){
	  app.use(express.limit(1048576000));
    app.use(express.bodyParser({uploadDir: __dirname + '/public/upload', keepExtensions:true}));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'ILHBnluib',
    store: app.authHelper.store,
    cookie: { maxAge: 900000 }}));
  app.use(i18n.init);
  // Поддержание сессии, сессия обнуляется после периода неактивности
  app.use(Auth.sessProc);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('models', models);
  app.set('hlp', helpers);
  app.set('authlib', Auth);
  app.set('baseUrl', '/');
  app.set('accessError', '/accessError');

  app.use(app.router);

    app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
/*  app.use(app.authHelper.everyauth.middleware(app));*/
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Routes

// Маршруты страниц и разделов
app.get('/', routes.index);

//Служебные маршруты
/*app.get('/setadmin', routes.setadmin);
app.get('/setuser', routes.setuser);
app.get('/delauth', routes.delauth);

app.get('/checksession', routes.checksession);*/

//Страница о сервисе
app.get('/about', routes.about);

/* Разделы сайта */


//Просмотр чужого профиля
app.authGet('/profileview', routes.profileview.index, ['admin', 'expert', 'editor', 'moder']);
//Страница каталога
app.get('/catalog', routes.catalog.index);
//Страница учебных курсов
app.get('/lesson', routes.lesson.index);
//Инвайты
app.all('/invite', routes.invite.index);
//Проверка кода
app.get('/invite/accept', routes.invite.accept);
//проверка кода для изменения логина или пароля
app.get('/profile/saveempass', routes.profile.saveempass);
//Страница сообщения об ошибке в правах доступа
app.get('/accessError', routes.accessError);
//Ошибка с разным там текстом
app.get('/error', routes.error);

// Загрузка фотографий\видеозаписей
app.authPost('/upload', routes.upload, ['admin', 'expert', 'editor']);

//Страница перенаправления на альбомы
app.authGet('/album', routes.album.index, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/getalb", routes.album.getalb, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/savephoto", routes.album.savephoto, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/deleteNoAlb", routes.album.deleteNoAlb, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/photoInfo", routes.album.photoInfo, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/photoUpload", routes.album.photoUpload, ['admin', 'expert', 'editor', 'moder']);
app.authGet("/album/view", routes.album.view, ['admin', 'expert', 'editor', 'moder']);
app.authGet("/album/upload", routes.album.upload, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/uploadProcess", routes.album.uploadProcess, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/PhotoControl", routes.album.PhotoControl, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/album/deleteAlb', routes.album.deleteAlb, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/photo_ajax", routes.album.photo_ajax, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/getPhoto", routes.album.getPhoto, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/album/setAlbumFace", routes.album.setAlbumFace, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/album/createAlb', routes.album.createAlb, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/album/savealb', routes.album.savealb, ['admin', 'expert', 'editor', 'moder']);
app.post('/album/show', routes.album.show);

//Видеоальбом
app.authGet('/valbum', routes.valbum.index, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/valbum/deletenosaved", routes.valbum.deletenosaved, ['admin', 'expert', 'editor', 'moder']);
// app.authGet("/valbum/upload", routes.valbum.upload, ['admin', 'expert', 'editor', 'moder']);
// app.authPost("/valbum/uploadProcess", routes.valbum.uploadProcess, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/valbum/vUpload", routes.valbum.vUpload, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/valbum/deleteValb', routes.valbum.deleteValb, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/valbum/video_ajax", routes.valbum.video_ajax, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/valbum/getVideo", routes.valbum.getVideo, ['admin', 'expert', 'editor', 'moder']);
app.authPost("/valbum/add_video", routes.valbum.add_video, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/rest/createValbum', routes.rest.createValbum, ['admin', 'expert', 'editor', 'moder']);

// Маршруты для постов
app.authPost('/posts/create', routes.post.create, ['admin','expert','editor','moder']);
app.authPost('/posts/get', routes.post.get, ['admin','expert','editor','moder']);

// Маршруты для мероприятий
app.get("/activity", routes.activity.index);
app.post("/activity/getactsday", routes.activity.getactsday);
app.authGet('/activity/new', routes.activity.new, ['admin', 'editor']);
app.authPost('/activity/create', routes.activity.create, ['admin', 'editor']);
app.authPost('/activity/setFace', routes.activity.setFace, ['admin', 'editor']);
app.authPost('/activity/cropFace', routes.activity.cropFace, ['admin', 'editor']);
app.authPost('/activity/getusers', routes.activity.getusers, ['admin', 'editor']);
app.authPost('/activity/loadphoto', routes.activity.loadphoto, ['admin', 'editor']);
app.authPost('/activity/loadvideo', routes.activity.loadvideo, ['admin', 'editor']);
app.get('/activity/id/*', routes.activity.view);
app.post('/activity/getuser', routes.activity.getuser);
app.authPost('/activity/include_member', routes.activity.include_member, ['editor', 'expert']);
app.authPost('/activity/outclude_member', routes.activity.outclude_member, ['editor', 'expert', 'admin']);

// Маршруты для событий
app.authPost('/events/create', routes.events.create, ['admin', 'editor', 'expert']);
app.authGet('/events/:id', routes.events.list, ['admin', 'editor', 'expert']);
app.authPost('/events/load', routes.events.load, ['admin', 'editor', 'expert']);
app.authGet('/event/delete/:id', routes.events.delete, ['admin', 'editor', 'expert']);
app.authGet('/event/:id', routes.events.show, ['admin', 'editor', 'expert']);
app.authGet('/event/:id/edit', routes.events.edit, ['admin', 'editor', 'expert']);
app.authPost('/event/:id/edit', routes.events.edit_post, ['admin', 'editor', 'expert']);

app.get('/profile/empasschanged', routes.profile.empasschanged);
app.get('/profile/authErr', routes.profile.authErr);

//регистрация по коду
app.post('/invite/register', routes.invite.register);
app.post('/rest/feedback', routes.rest.feedback);
app.post('/rest/invloader', routes.rest.invloader);

//Отправка ответа
app.authPost('/rest/sendAnswer', routes.rest.sendAnswer, ['admin']);
//Управление dict'ами через админку
app.authPost('/rest/admindicts', routes.rest.admindicts, ['admin']);

app.post('/rest/prephoto', routes.rest.photoPreload);//, ['admin', 'expert', 'editor', 'moder']);
app.post('/rest/savephoto', routes.rest.photoSave);

//редактирование профиля администратором
app.authPost("/rest/adminRedact", routes.rest.adminRedact, ['admin']);

app.post('/rest/invite/checkmail', routes.rest.checkMailInvite);

app.authGet('/profile', routes.profile.index, ['admin', 'expert', 'editor', 'moder']);
app.authPost('/rest/profedit', routes.rest.profEdit, ['admin', 'expert', 'editor', 'moder']);
app.post('/rest/restorepass', routes.rest.restorepass);
app.get('/profile/restorepass', routes.profile.restorepass);

//Маршруты для rest API
app.get('/rest', routes.rest.index);
//API инвайтов
/*app.all('/rest/invite', routes.rest.mailSend);*/
app.all('/rest/login', routes.rest.login);

app.all('/rest/logout', routes.rest.logout);
app.authPost('/rest/invsend', routes.rest.invSend, ['admin']);

//Маршруты для админки
app.authGet('/admin', routes.admin.index, ['admin']);
app.authGet('/admin/invites', routes.admin.invites, ['admin']);
app.authGet('/admin/feedbacks', routes.admin.feedbacks, ['admin']);
app.authGet('/admin/newinvites/', routes.admin.newinvites, ['admin']);
app.authGet('/admin/neginvites/', routes.admin.neginvites, ['admin']);
app.authGet('/admin/invite', routes.admin.invite, ['admin']);
app.authGet('/admin/dicts', routes.admin.dicts, ['admin']);
app.authGet("/admin/negativeSend", routes.admin.negativeSend, ['admin']);
app.authGet('/admin/deleteFeedb', routes.admin.deleteFeedb, ['admin']);
app.authGet('/admin/add_act', routes.admin.add_act, ['admin']);
app.authGet('/admin/act_list', routes.admin.act_list, ['admin']);
app.authPost('/admin/admin_update', routes.admin.admin_update, ['admin']);
app.authPost("/rest/sendNegativeMessage", routes.rest.sendNegativeMessage, ['admin']);

//app.authGet('/admin/many_clone', routes.admin.many_clone, ['admin']);

app.authGet('/admin/sendInvite', routes.admin.sendInvite, ['admin']);
app.authPost('/admin/sendInvite', routes.admin.sendInvite, ['admin']);
/*
app.authGet('/admin/inviteconvert', routes.admin.inviteconvert, ['admin']);*/

app.authGet('/admin/feedback', routes.admin.feedback, ['admin']);

app.authGet('/admin/inviteconvert', routes.admin.inviteconvert, ['admin']);


app.get('/search', routes.search.index);
app.authPost('/search/resOfSearch', routes.search.resOfSearch, ['admin', 'editor', 'expert', 'moder']);

app.authGet('/search/resOfSearch', routes.search.resOfSearch, ['admin', 'editor', 'expert', 'moder']);

/*app.get('/admin', auth.checkroutes.admin.index);*/

app.listen(process.env.port || 3000);
//app.listen(3000);
console.log("Express server listening on port %d in %s mode");
