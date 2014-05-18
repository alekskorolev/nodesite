//Индексный	 маршрут раздела учебных программ
exports.index = function(req, res){
  res.render('lesson/index', { 
  	page: { 
  		title: 'Media Expert - lesson' 
  	},
    user: req.session
  });
};