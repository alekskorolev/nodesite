//Индексный	 маршрут раздела каталогов
exports.index = function(req, res){
  res.render('catalog/index', { 
  	page: { 
  		title: 'Media Expert - catalog' 
  	},
    user: req.session
  });
};
