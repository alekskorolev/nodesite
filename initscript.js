exports.start = function (options) {	
//Создание тестовых аккаунтов
	var Users = options.models.users;
	Users.remove({ userid: 'admin@admin.ad' }, function (err) {
		//if (err) return handleError(err);
	  // removed!
	});
	var user = new Users({ 
		userid: 'admin@admin.ad',  
		pass: 'adminadmin',
		role: 'admin',
		invid: 'norequired',
		email: 'admin@admin.ad',
		name: "Админ",
		faname: "Админович",
		family: "Админов"
	});
	user.save(function (err, user) {
		console.log('result', err, user);
	});
	console.log('save')

	// Создание словарей
	var Dicts = options.models.dicts;
	var dicts = [
		new Dicts({dict: "Prof", title: "Юрист", enable: true}),
		new Dicts({dict: "Prof", title: "Психолог", enable: true}),
		new Dicts({dict: "Prof", title: "Врач", enable: true}),
		new Dicts({dict: "Prof", title: "Писатель", enable: true}),
		new Dicts({dict: "Interest", title: "Спорт", enable: true}),
		new Dicts({dict: "Showtheme", title: "Политика", enable: true}),
		new Dicts({dict: "Showtype", title: "Комедия", enable: true})
		]
	for (var item in dicts) {
		console.log(eval(dicts[item]));
		dicts[item].save(function (err, saveDict, rowAff) {

		});
	}
};