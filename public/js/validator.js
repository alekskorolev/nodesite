var regexp = require('./regexp');
// Проверка на корректность данных отправленной формы регистрации
exports.register = function (body) {
	var errorList = {
		registerMail: "",
		empty: true	
	};
	if (!body.registerMail || body.registerMail=="") {
		errorList.empty = false;
		errorList.registerMail = "Обязательное поле";
	} else if (!(regexp.mail.test(body.registerMail))) {
		errorList.empty = false;
		errorList.registerMail = "Некорректный формат";
	}
	return errorList;
	
};
exports.editprofile = function (body) {
	var errorList = {
		profEmail: "",
		empty: true
	};
	if (!(regexp.mail.test(body.inviteEmail))) { // Проверка формата поля Email
		errorList.inviteEmail = "Недопустимый формат";
		errorList.empty = false;
	}
}
//Проверка корректности сообщения обратной связи
exports.feedback = function(body){
	var errorList = {
			feedbackName: "",
			feedbackMail: "",
			feedbackMsg: "",
			empty: true
		};	
	if (!body.feedbackName || body.feedbackName == "") {
		errorList.feedbackName = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.fio.test(body.feedbackName))) {
		errorList.feedbackName = "Недопустимый формат";
		errorList.empty = false;		
	};
	// Проверка наличия заполненного поля Email
	if (!body.feedbackMail || body.feedbackMail == "") {
		errorList.feedbackMail = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.mail.test(body.feedbackMail))) { // Проверка формата поля Email
		errorList.feedbackMail = "Недопустимый формат";
		errorList.empty = false;
	};
	// Проверка наличия заполненного поля
	if (!body.feedbackMsg || body.feedbackMsg == "") {
		errorList.feedbackMsg = "Обязательное поле";
		errorList.empty = false;
	}
	return errorList;

};
//Проверка данных запроса инвайта
exports.invite = function(body, files){
	var errorList = {
		inviteFam: "",
		inviteName: "",
		inviteFName: "",
		inviteWork: "",
		inviteEmail: "",
		inviteWhy: "",
		inviteVideo: "",
		inviteFile: "",
		empty: true
	};
	// Проверка наличия заполненного поля ФИО
	if (body.inviteFam == "") {
		errorList.inviteFam = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.fio.test(body.inviteFam))) {
		errorList.inviteFam = "Недопустимый формат";
		errorList.empty = false;		
	};
	if (body.inviteName == "") {
		errorList.inviteName = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.fio.test(body.inviteName))) {
		errorList.inviteName = "Недопустимый формат";
		errorList.empty = false;		
	};
	if (body.inviteFName == "") {
		errorList.inviteFName = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.fio.test(body.inviteFName))) {
		errorList.inviteFName = "Недопустимый формат";
		errorList.empty = false;		
	};
	// Проверка наличия заполненного поля Работы
	if (body.inviteWork == "") {
		errorList.inviteWork = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.fio.test(body.inviteWork))) {
		errorList.inviteWork = "Недопустимый формат";
		errorList.empty = false;		
	};
	
	// Проверка наличия заполненного поля Email
	if (body.inviteEmail == "") {
		errorList.inviteEmail = "Обязательное поле";
		errorList.empty = false;
	} else if (!(regexp.mail.test(body.inviteEmail))) { // Проверка формата поля Email
		errorList.inviteEmail = "Недопустимый формат";
		errorList.empty = false;
	};
	// Проверка наличия заполненного поля Url
	if (body.inviteUrl == "") {
		if (!files) {
			errorList.inviteUrl = "Обязательное поле";
			errorList.empty = false;
		} /*else if (!regexp.videoload.type.test(files.inviteVideo.type) 
				|| !regexp.videoload.size > files.size 
				|| !regexp.videoload.name.test(files.inviteVideo.name)) {
			errorList.inviteFile = "Некорректный файл";
			errorList.empty = false;			
		}*/
	} else if (!(regexp.url.test(body.inviteUrl))) { // Проверка формата поля Email
		errorList.inviteUrl = "Недопустимый формат";
		errorList.empty = false;
	};
	// Проверка наличия заполненного поля
	if (body.inviteWhy == "") {
		errorList.inviteWhy = "Обязательное поле";
		errorList.empty = false;
	}
	return errorList;

};