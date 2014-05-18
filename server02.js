var express = require('express'),
  routes = require('./routes'),
  ejs = require('ejs'),
  email = require("emailjs"),
  i18n = require("i18n"),
  mongoose = require('mongoose'),
  models = require('./models').create(mongoose),
  helpers = require('./lib/helpers'),
  Auth = require('./lib/auth');
  mongoose.connect('mongodb://localhost/mediaexp');

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
    app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'ILHBnluib',
    store: app.authHelper.store,
    cookie: { maxAge: 900000 }}));
  app.use(i18n.init);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('models', models);
  app.set('hlp', helpers);
  app.set('baseUrl', '/');

  app.use(app.router);



    app.use(express.methodOverride());
/*  app.use(express.static(__dirname + '/public'));*/
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

//Страница каталога
app.get('/catalog', routes.catalog.index);
//Страница учебных курсов
app.get('/lesson', routes.lesson.index);
//Инвайты
app.all('/invite', routes.invite.index);
//Проверка кода
app.get('/invite/accept', routes.invite.accept);

//регистрация по коду
app.post('/invite/register', routes.invite.register);


//Маршруты для rest API
app.get('/rest', routes.rest.index);
//API инвайтов
/*app.all('/rest/invite', routes.rest.mailSend);*/
app.all('/rest/login', routes.rest.login);

app.all('/rest/logout', routes.rest.logout);
app.authPost('/rest/mailsend', routes.rest.mailSend, ['admin']);





//Маршруты для админки
app.authGet('/admin', routes.admin.index, ['admin']);
app.get('/search', routes.search.index);

/*app.get('/admin', auth.checkroutes.admin.index);*/

app.listen(process.env.port || 3002);
//app.listen(3000);
console.log("Express server listening on port %d in %s mode");