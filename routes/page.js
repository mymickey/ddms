var Promise = require("bluebird");

exports.showList = function (req, res, next) {
  req.models.Page.list(function (error, docs) {
    if (error) return next(error);
    res.render('pages/list', {forms: docs});
  });
};
exports.showListByProjectId = function (req, res, next) {
  var pid = req.params.projectid;
  var pp = Promise.resolve( req.models.PageProject.findOne({_id: pid}) );
  var fp = Promise.resolve( req.models.Page.listByProjectId(pid) );

  Promise.all([pp,fp])
    .then(function(docs){
      res.render('pages/list', {project: docs[0],pages: docs[1]});
    }).catch(function (error) {
      return next(error);
    });
};

exports.showCreateForm = function (req, res, next) {
  var pid = req.params.projectid;
  var pp = Promise.resolve( req.models.PageProject.findOne({_id: pid}) );

  pp.then(function(docs){
    res.render('pages/add', {project: docs});
  }).catch(function (error) {
    return next(error);
  });
};

exports.showUpdateForm = function (req, res, next) {
  var id = req.params.id;
  req.models.Page.findOne({
    _id: id
  }, function (ferror, fres) {
    res.render('pages/edit',{form: fres});
  });
};

exports.createPage = function (req, res, next) {
  var pid = req.params.projectid;
  var result = {code: 1,msg: 'ok'};
  var body = req.body;
  if (!body.title & !body.htmlContent){
    result.code = 0;
    result.msg = 'Title is required!';
    res.send(result);
  }
  var form = {
    project: pid,
    user: req.session.user.id,
    title: body.title,
    desc: body.desc,
    htmlContent: body.htmlContent,
    htmlFileName:body.htmlFileName
  }
  req.models.Page.create(form, function (cerror, cres) {
    if (cerror){
      result.code = 0;
      result.msg = 'Failed!';
    }else{
      result.data = cres;
    }
    res.send(result);
  });
};

exports.updateForm = function (req, res, next) {
  var result = {code: 1,msg: 'ok'};
  var body = req.body;
  if (!body.title){
    result.code = 0;
    result.msg = 'Title is required!';
    res.send(result);
    return;
  }
  var form = {
    title: body.title,
    desc: body.desc,
    htmlContent: body.htmlContent,
    updateDateTime: new Date,
    formId:body.formId,
    htmlFileName:body.htmlFileName
  }
  req.models.Page.update({_id: body._id}, form,function (cerror, cres) {
    if (cerror){
      result.code = 0;
      result.msg = 'Failed!';
    }
    res.send(result);
  });
};

exports.deleteForm = function (req, res, next) {
  var id = req.params.id;
  var fpd = Promise.resolve( req.models.Page.findOne({_id: id}) );

  fpd.then(function(fpdres){
    var fp = Promise.resolve( req.models.Page.remove({_id: id}) );
    var dp = Promise.resolve( req.models.PageData.remove({form: id}) );
    Promise.all([fp,dp])
      .then(function(docs){
        res.redirect('/pages/'+fpdres.project);
      }).catch(function (error) {
        return next(error);
      });
  }).catch(function (error) {
    return next(error);
  });
};

exports.copyForm = function (req, res, next) {
  var id = req.params.id;
  req.models.Page.findOne({
    _id: id
  }, function (ferror, fres) {
    if(fres){
      var form = {
        project: fres.project,
        user: req.session.user.id,
        title: '[COPY]-'+fres.title,
        desc: fres.desc,
        schemata: fres.schemata
      }
      req.models.Page.create(form, function (cerror, cres) {
        res.redirect('/pages/'+fres.project);
      });
    }else{
      res.redirect('/forms');
    }
  });
};

function formatFormSchemata(child,isSub){
  child = Array.isArray(child)?child:[];
  var filtered = [];
  filtered = child.filter(function(key){
    if(!isSub){
      key.child = formatFormSchemata(key.child,true);
      key.required = key.required=='true';
    }
    return key.name!='';
  });
  return filtered;
}
