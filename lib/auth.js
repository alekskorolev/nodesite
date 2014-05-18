exports.init = function (options) {
	var ret = {};
	var SessionStore = require("session-mongoose")(options.express);
	ret.store = new SessionStore({
	      url: options.dbUrl,
	      interval: options.expire, // expiration check worker run interval in millisec (default: 60000)
	  });
	/*
	* Добавляем приложению расширенные метода авторизационого роутинга
	* authGet - переопределенный метод app.get, принимает (маршрут - строка, функция маршрута, массив ролей)
	* authPost - переопределенный метод app.get, принимает (маршрут - строка, функция маршрута, массив ролей)
	* authAll - переопределенный метод app.get, принимает (маршрут - строка, функция маршрута, массив ролей)
	*/
	options.app.authGet = function (route, callback, role) {
	  options.app.get(route, function (res, req) {
	      ret.check(res, req, callback, role);
	  })
	};

	options.app.authPost = function (route, callback, role) {
	  options.app.post(route, function (res, req) {
	      ret.check(res, req, callback, role);
	  })
	};

	options.app.authAll = function (route, callback, role) {
	  options.app.all(route, function (res, req) {
	      ret.check(res, req, callback, role);
	  })
	};
	/*
	* Проверка авторизации для маршрута. Поддержка ролей
	* req, res - запрос и ответ
	* route - вызываемый маршрут
	* role - массив ролей, которым разрешен переход по этому маршруту
	*/

	ret.check = function (req, res, route, role) {
		if (req.session.authorized && role.indexOf(req.session.role)!=-1) route(req, res) 
			else res.redirect(options.app.get('accessError'));
	}
	return ret;
}

// Поддержание сессии, сессия обнуляется после периода неактивности
exports.sessProc = function (req, res, next) {
	var now = new Date();
	req.session.lastupdate = now.getTime();
	next();
}

exports.login = function (req, user) {
	req.session.role = user.role;
	req.session.uid = user._id;
	req.session.userid = user.userid;
	req.session.authorized = true;	
}