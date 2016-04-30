var routes = require('./index');
var Promise = require("bluebird");
var fu = require('fileutil');
var fs  = require('fs')
var path = require('path')
var extName = '.html'
function createHTMLFile(opt){
  var uploadDir = path.join(__dirname,'uploads');
  var filepath = path.join(uploadDir,opt.htmlFileName + extName);
  fu.touch(filepath);
  fs.writeFile(filepath, opt.htmlContent, 'utf8', function(err){
    console.log(err);
  });

}
function uploadHTMLFile(){

}
exports.syncToCDN = function (req, res, next) {
	var id = req.body.pageid;
  if (!id){
    res.send({err:'pageid is required'});
    return;
  }
  var queryData = new Promise(function(resolve,reject){
      req.models.Page.findOne({
        _id: id
      }, function (ferror, fres) {
        if (!ferror) {
          var respJSON = {};
          var htmlFileName = fres.htmlFileName;
          var htmlContent = fres.htmlContent;
          var formId = fres.formId;
          if (!htmlFileName) {
            respJSON.err = 'htmlFileName is required'
          }
          else if (!htmlContent) {
            respJSON.err = 'htmlContent is required'
          }
          else if (!formId) {
            respJSON.err = 'formId is required'
          }else{
            resolve(fres);
            return fres;
          }
          if (respJSON.err) {
            res.send({respJSON});
          };
        }
        //res.render('pages/edit',{form: fres});
      });
  });
  queryData
    .then(createHTMLFile)

};
