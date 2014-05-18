     /*
Роуты страниц поиска
*/

exports.index = function(req, res){
	var Dicts = app.get("models").dicts;
	var advanced = req.query.advanced || false;

	//Собираем массив словарей для формы поиска
	Dicts.find({dict: "Prof", enable: true}).sort({title: 1}).exec( function (err, dicts) {
		if (err) {
			console.log("Ошибка поиска словарей для формы поиска. Ошибка: ", err);
			res.send(err);
		} else {
			res.render('search/index', { 
			  	page: { 
			  		title: 'Media Expert - admin panel' 
			  	},
		    	user: req.session,
		    	dicts: dicts,
		    	advanced: advanced
			  });	
		}
	});
};

//Поиск экспертов в базе и генерация страницы результатов поиска
exports.resOfSearch = function (req, res){

	//Получаем параметры GET запроса, записываем их в переменную req.body
	// query = require('url').parse(req.url, true);
	req.body = (req.method == "GET") ? req.query : req.body;
	//Формируем результат поиска
	//console.log("Параметры поиска: ", req.body);

	var 
		Users = app.get("models").users,
		PageIndex = req.body.page || 1, //Индекс страницы
		PageCount = req.body.pagecount || 5; //Количество экспертов на одной странице
		if (req.body.pagecount === 'max') {
			PageCount = 0;
		}

	//console.log(req.body);

	//Формируем переменны для состаления QUERY-запроса
	//Если запрос по профессии строка, превращаем ее в массив
	if (typeof req.body.prof == "string") req.body.prof = req.body.prof.split("!@#!@#32@@");
	if (req.body.prof) { queryProf = {$in: req.body.prof}; } else { queryProf = null; }
	if (req.body.name) { queryName = new RegExp(req.body.name, 'i'); } else {queryName = "";}
	if (req.body.faname) { queryFaname = new RegExp(req.body.faname, 'i'); } else {queryFaname = "";}
	if (req.body.family) { queryFamily = new RegExp(req.body.family, 'i'); } else {queryFamily = "";}
	if (req.body.gender) { queryGender = new RegExp('^'+req.body.gender, 'i'); } else {queryGender = "";}
	if (req.body.adress) { queryAdress = new RegExp(req.body.adress, 'i'); } else {queryAdress = "";}
	if (req.body.rating) { queryRating = req.body.rating; } else { queryRating = null; }

	//Результаты поиска исходя из роли авторизованного пользователя
	if (req.session.role=='admin') {
		queryRole = null;
	}
	if (req.session.role=='editor') {
		queryRole = ["expert", "editor"];
	}
	if (req.session.role=='expert') {
		queryRole = ["expert"];
	}
	if (!req.session.authorized) {
		queryRole = [];
	}

	//Формируем параматры поиска по возрасту
	var qBday = false; //Указан ли возраст
	if (req.body.age) {
		console.log("age str: ", !!(req.body.age.indexOf("-")+1));
		if (req.body.age.indexOf("-")+1) {
			arr = req.body.age.split("-");
			
			if (arr[0]>arr[1]) {
				buff = arr[0];
				arr[0] = arr[1];
				arr[1] = buff;
			}
			console.log("arr: ", arr, "arr[1]: ", (parseInt(arr[1])+1));
			//Вычисляем минимальную дату рождения
			dMin = new Date();
			console.log(dMin.getTime(), " ", (31536000000*(parseInt(arr[1])+1)));
			dMin = dMin.getTime() - (31536000000*((parseInt(arr[1])+1)) - 86400);
			dMin = new Date(dMin);
			//Вычисляем максимальную дату рождения
			dMax = new Date();
			dMax = dMax - (31536000000*(arr[0]));
			dMax = new Date(dMax);

			queryMinage = dMin;
			queryMaxage = dMax;
			qBday = true;
			console.log("Diapason: ", dMin, " ::: ", dMax);
		} else {
			if (req.body.age>0&&req.body.age<99) {
				/*
					Чтобы получить всех пользователей с указанным возрастом, нужно вычислить минимальное и 
					максимальное время рождения пользователя, т.к. в базе нет точного значения
					возраста.
				*/
				qBday = true;

				dNow = new Date();
				dNow = dNow - (31536000000)*req.body.age;
				dWithoutYear = new Date(dNow - 31536000000);
				dNow = new Date(dNow);
				console.log("AGE: ", dNow, " ", dWithoutYear);
				queryMinage = dWithoutYear; queryMaxage = dNow;
			} else {
				console.log("Недопустимый диапазон возраста");
				qBday = false
			}
		}		
	}
	queryRole = ['admin', 'expert', 'redactor'];
	// if (req.session.role=='admin') {
	// 	queryRole[queryRole.length] = 'delete';
	// }
	//Формируем параметры отбора пользователей
	var query = {
		name: queryName,
		name: {$exists: true},
		faname: queryFaname,
		family: queryFamily,
		gender: queryGender,
		adress: queryAdress,
		prof: queryProf,
		rating: queryRating,
		role: {$in: queryRole},
		bday: qBday ? {$gte: queryMinage, $lt: queryMaxage} : null,
		_id: req.body.users? {$in: req.body.users} : null
	};
	for (el in query) {
		if (!query[el]) delete query[el];
	}
	//console.log("QUERY: ", query);
	// Поиск, который возвращает нужную страницу
	Users.find(query).skip( (PageIndex - 1)*PageCount ).limit(PageCount).sort({rating: -1}).exec( function (err, user) {
		if (err) {
			console.log("Ошибка поиска", err);
			res.send("Ошибка поиска", err);
		} else {
			if(!user) {
				console.log("По текущему запросу не найден ни один юзер");
			} else {
				var count = Users.count(query).exec( function(err, count) {
					user.count = count;
					user.pagecount = PageCount;
					user.pageindex = PageIndex;
					user.pages = Math.ceil(count/PageCount);
					user.query = req.body;

					//console.log(user);
					if (!req.body.users) {
						res.render("search/resultate-of-search", {
							page: {
								title: 'Media Expert - result of search'
							},
							user: req.session,
							results: user
						});				
					} else {
						res.send(user);
					}
				});
	
			}
		}
	});
}