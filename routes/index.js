exports.user = require('./user');
exports.project = require('./project');
exports.pageProject = require('./pageProject');
exports.page = require('./page');
exports.sync = require('./syncToCDN');
exports.admin = require('./admin');
exports.form = require('./form');
exports.formData = require('./formData');
exports.image = require('./image');
exports.fileUpload = require('./fileUpload');
/* GET home page. */
exports.index = function (req, res, next) {
  res.render('index', {title: 'DDMS'});
};
