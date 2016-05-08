//var routes = require('./index');
var Promise = require("bluebird");
var fu = require('fileutil');
var fs  = require('fs')
var path = require('path')
var extName = '.json';
var projectDirName = 'form_project';
var uploadOSS = require('upload-oss');
var formProcessor = require('../formProcessor/html_form_processor')

function createJSONFile(opt){
  return new Promise(function(resolve,reject){
    var _extName = extName;
    var uploadDir = path.join(__dirname,'uploads');
    var filepath = path.join(uploadDir,opt._id + _extName);
    var content=  JSON.stringify(opt);
    var contentJSON = JSON.parse(content);
    delete contentJSON.project;
    delete contentJSON.user;
    delete contentJSON.cdnURL;
    fu.touch(filepath);
    fs.writeFile(filepath, JSON.stringify(contentJSON), 'utf8', function(err){
       if (!err) {
          opt.filepath = filepath
          resolve(opt)
       }else{
          reject(err)
       }
    });
  });
}



function uploadJSONFile(opt){
  var filePath = opt.filepath;
  var uploadOpt = {
    fileName:filePath,
    dirName:path.join(projectDirName,opt.project.name)
  }
  return new Promise(function(resolve,reject){
    uploadOSS.upload(uploadOpt,function(err,url){
      if (err) {
        reject(err);
      }else{
        resolve(url)
      }
      fu.delete(filePath)
    })
  })
}
function syncDB_cdn_url(fromModel,id,url){
  //将上传后的cdn地址同步到db
  return new Promise(function(resolve,reject){
    fromModel.findOneAndUpdate({_id:id},{cdnURL:url},function(err,doc){
      console.log(err);
      if (err) {
        reject({msg:'syncDB_cdn_url err',e:err})
      }else{
        resolve(url)
      }
    })
  });

}
exports.syncToCDN = function (req, res, next) {
	var id = req.body.id;

  if (!id){
    res.send({err:'form is required'});
    return;
  }
  var queryData = new Promise(function(resolve,reject){
        req.models.Form.findOne({
          _id: id
        })
        .populate('project')
        .exec(function (ferror, fres) {
          if (!ferror) {
            resolve(fres);

          }
          //res.render('pages/edit',{form: fres});
        });

  });
  queryData
    .then(createJSONFile)
    .then(uploadJSONFile)
    .then(function(url){
      return syncDB_cdn_url(req.models.Form,id,url)
    })
    .then(function(url){
      res.send({url:url,code:1,msg: 'ok'})
    })
    .catch(function(e){
      res.send({err:e})
    })

};
