/*
Модели пользователей.
TODO: Добавить методы валидации.
*/
var os = require('os');
var winTest = /^Windows.*/g;
//Хак для запуска под виндой
if (winTest.test(os.type())) {
	var bcrypt = require('ccrypt');
} else {
	var bcrypt = require('bcrypt');
}
// Создание схемы и модели
exports.create = function (mongoose) {
	var usersSchema = mongoose.Schema({
		userid: {type: String, required: true, unique: true, index: true },
		pass: {type: String, unique: false },
		newpass: String,
		role: String,
		invid: {type: String, required: true, unique: true },
		regdate: { type: Date, default: Date.now },
		code: String,
		saveeditcode: String,
		newemail: String,
		rating: {type: Number, default: 0},
		// Перенесенные из профиля поля
		photo: String,
		family:  String,
		name: String,
		faname: String,
		work: String,
		email: {type: String, required: true, unique: true},
		newmail: String,
		gender: String,
		bday: { type: Date, default:  Date()},
		edu: String,
		phone: String,
		eduname: String,
		addedu: String,
		adress: String,
		visibleset: String,
		urlVk: {type: String},
		urlFacebook: {type: String},
		urlUser: {type: String},
		interest: [],
		prof: [],
		showtype: [],
		showtheme: []
	});

	// Проверяем пароль
	usersSchema.methods.comparePassword = function(candidatePassword, cb) {
		    bcrypt.compare(candidatePassword, this.pass, function(err, isMatch) {
		    	console.log(err)
		        if (err) return cb(err);
		        cb(null, isMatch);
		    });
	};
	
	var Users = mongoose.model('Users', usersSchema);
	// Перед сохранением, криптуем пароль, если он еще не закриптован
	usersSchema.pre('save', function(next) { 
		console.log(this.pass);
	    if(this.pass && this.pass[0]!='$') {                                                                                                                                                        
	        var salt = bcrypt.genSaltSync(10);                                                                                                                                     
	        this.pass  = bcrypt.hashSync(this.pass, salt);                                                                                                                
	    }                                                                                                                                                                          
	    next();                                                                                                                                                                     
	});

	/*
	*	Блок валидации сохраняемых значений
	*/
	// проверка на существование такого пользователя
	// usersSchema.path('userid').validate(function (value, respond) {                                                                                           
	//     Users.findOne({ userid: value }, function (err, user) {                                                                                                
	//         if(user) { 
	//         	respond(false); 
	//         } else {
	//         	respond(true);
	//         }
	//     });
	// }, 'USER_ALREADY_EXIST');

	return Users;
};