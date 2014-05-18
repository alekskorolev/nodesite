/*
Модели сообщений обратной связи.
TODO: Добавить методы валидации.
*/
exports.create = function (mongoose) {
	var feedbacksSchema = mongoose.Schema({
		name: String,
		email: String,
		msg: String,
		enable: {type: Boolean, default: true}
	});
	var Feedbacks = mongoose.model('Feedbacks', feedbacksSchema)
	return Feedbacks;
}