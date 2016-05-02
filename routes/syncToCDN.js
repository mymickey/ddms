//var routes = require('./index');
var Promise = require("bluebird");
var fu = require('fileutil');
var fs  = require('fs')
var path = require('path')
var extName = '.html';
var projectDirName = 'project';
var uploadOSS = require('../oss/upload-oss');
var formProcessor = require('../formProcessor/html_form_processor')

function createHTMLFile(opt){
  return new Promise(function(resolve,reject){
    var _isHTMLFileName = isHTMLFileName(opt.htmlFileName);
    var _extName = !_isHTMLFileName ? extName : '';
    var uploadDir = path.join(__dirname,'uploads');
    var filepath = path.join(uploadDir,opt.htmlFileName + _extName);
    fu.touch(filepath);
    fs.writeFile(filepath, opt.htmlContent, 'utf8', function(err){
       if (!err) {
          opt.filepath = filepath
          resolve(opt)
       }else{
          reject(err)
       }
    });
  });
}
function padFormData(opt){
  if (!opt.form) {
    return opt;
  };
  return new Promise(function(resolve,reject){
    formProcessor.processHTMLForm(opt.filepath,opt.filepath,JSON.stringify(opt.form));
    resolve(opt)
  })
}
function updateDBHTMLContent(PageModel,id,opt){
  return new Promise(function(resolve,reject){
    var content = fs.readFileSync(opt.filepath, 'utf-8');
    PageModel.findOneAndUpdate({
      _id:id
    },{
      htmlContent:content
    },function(err,doc){
      if (!err) {
        resolve(opt)
      }else{
        reject(err)
      }
    })
  })
}
function isHTMLFileName(htmlFileName){
  var index= htmlFileName.lastIndexOf(extName);
  var _extName = htmlFileName.slice(index,htmlFileName.length);
  var result = _extName.toLowerCase() == extName;
  return result;
}
function uploadHTMLFile(opt){
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
function syncDB_cdn_url(pageModel,id,url){
  //将上传后的cdn地址同步到db
  return new Promise(function(resolve,reject){
    pageModel.findOneAndUpdate({_id:id},{cdnURL:url},function(err,doc){
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
	var id = req.body.pageid;
  if (!id){
    res.send({err:'pageid is required'});
    return;
  }
  var queryData = new Promise(function(resolve,reject){
        req.models.Page.findOne({
          _id: id
        })
        .populate('form')
          .populate('project')
        .exec(function (ferror, fres) {
          if (!ferror) {
            var respJSON = {};
            var htmlFileName = fres.htmlFileName;
            var htmlContent = fres.htmlContent;
            if (!htmlFileName) {
              respJSON.err = 'htmlFileName is required'
            }
            else if (!htmlContent) {
              respJSON.err = 'htmlContent is required'
            }
            else{
              resolve(fres);
              return fres;
            }
            if (respJSON.err) {
              res.send(respJSON);
            };
          }
          //res.render('pages/edit',{form: fres});
        });

  });
  queryData
    .then(createHTMLFile)
    .then(padFormData)
    .then(function(opt){
      return updateDBHTMLContent(req.models.Page,id,opt)
    })
    .then(uploadHTMLFile)
    .then(function(url){
      return syncDB_cdn_url(req.models.Page,id,url)
    })
    .then(function(url){
      res.send({url:url,code:1})
    })
    .catch(function(e){
      res.send({err:e})
    })

};
