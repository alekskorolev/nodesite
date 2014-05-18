 var mongoose = require('mongoose');
 var models = require('./models').create(mongoose),
 mongoose.connect('mongodb://localhost/mediaexp');