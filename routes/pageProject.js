var _ = require('underscore');
var Promise = require("bluebird");
exports.showList = function (req, res, next) {
  req.models.PageProject.list(function (error, docs) {
    if (error) return next(error);
    res.render('pageProjects/list', {projects: docs});
  });
};

exports.showCreateProject = function (req, res, next) {
  res.render('pageProjects/add',{session: req.session});
};

exports.showUpdateProject = function (req, res, next) {
  var id = req.params.id;
  req.models.PageProject.findOne({
    _id: id
  }, function (ferror, fres) {
    res.render('pageProjects/edit',{session: req.session,project: fres});
  });
};

exports.createProject = function (req, res, next) {
  var body = req.body,
    u = {
      user: req.session.user.id,
      name: body.name,
      desc: body.desc
    };

  if (!u.name){
    u.error = 'Please enter project\'s name.'
  }
  if(u.error){
    return res.render('pageProjects/add',{session: req.session,project: u});
  }
  var queryRepeat =  new Promise(function(resolve,reject){
      req.models.PageProject.findOne({
        name:u.name.trim()
      },function(err,doc){
        if (doc) {
          u.error = 'project name repeat'
          reject(u)
        }else{
          resolve()
        }
      })
    });

  queryRepeat
  .then(function(){
    new req.models.PageProject(u).save(function(serror,sres){
      if(serror){
        u.error = serror.toString();
        return res.render('pageProjects/create',{session: req.session,project: u});
      }else if(sres){
        res.redirect('/pageProjects');
      }
    });
  })
  .catch(function(err){
    res.render('pageProjects/add',{session: req.session,project: err});
  })

};
exports.updateProject = function (req, res, next) {
  var body = req.body,
    u = {
      _id: body.id,
      name: body.name,
      desc: body.desc
    };

  if (!u.name){
    u.error = 'Please enter project name'
  }
  if(u.error){
    return res.render('pageProjects/add',{session: req.session,project: u});
  }
  req.models.PageProject.update({_id: u._id},{
    name: body.name,
    desc: body.desc
  },function (uerror, ures) {
    if (uerror) {
      return res.render('pageProjects/update/'+u._id, {session: req.session, project: u});
    } else if (ures) {
      res.redirect('/pageProjects');
    }
  });
};

exports.deleteProject = function (req, res, next) {
  var id = req.params.id;
  req.models.PageProject.findOne({
      _id: id
    },function(ferror, fres){
    if(fres){
      req.models.PageProject.remove({_id: id},function(){
        res.redirect('/pageProjects');
      });
    }else{
      res.redirect('/pageProjects');
    }
  });
};
