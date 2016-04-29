var busboy = require('connect-busboy');
var os = require('os');
var path = require('path');
var fs = require('fs');
var fu = require('fileutil');
var uuid = require('node-uuid');
var uploadOSS = require('../oss/upload-oss');

var fileSizeLimit = 5 * 1024 * 1024;
var uploadDir = path.join(__dirname,'uploads');
if (!fu.exist(uploadDir)) {fu.mkdir(uploadDir)};

exports.updateFile = function (req, res, next) {
  var limited = false,fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var uuidName = uuid.v4();
    var extName = path.extname(filename)
    var saveTo = path.join(uploadDir, uuidName+extName);
    fstream = fs.createWriteStream(saveTo);
    file.pipe(fstream);
    fstream.on('close', function () {
      if(fs.statSync(saveTo).size > 0 && fs.statSync(saveTo).size > fileSizeLimit){
        limited = true;
      }
      if(!limited){
        upload(saveTo,function(err,url){
          uploadComplete(err,url,res,req);
          deleteDoneFile(saveTo)
        });
      }
      else{
        deleteDoneFile(saveTo)
        uploadComplete({msg:'文件尺寸不合规'},' ',res);
      }



    });

  });
}
function deleteDoneFile(filePath){
  //上传到OSS之后 删除磁盘上的文件
  if (fu.exist(filePath)) {
    fu.delete(filePath)
  };
}
function uploadComplete(err, url,res,req){
  if (!err) {
    var image = {
      url: url,
      tags: ''
    }
    req.models.Image.create(image, function (cerror, cres) {
      if (cerror){
        console.log('create img err',cerror);
      }
    });
  };
  res.writeHead(200, { 'Connection': 'close' });
  var result = createResponseJSON(err,url);
  res.end(JSON.stringify(result));
}
function upload(filePath,fn){
  uploadOSS.upload(filePath,fn)
}
function createResponseJSON(err,url){
  if(!err){
    return {
      files:[{
        name:url,
        url:url,
        thumbnailUrl:url
      }]
    }
  }
  else{
    return {
      err:err,
      files:[{
        name:url,
        error:err.msg
      }]
    }
  }
}
