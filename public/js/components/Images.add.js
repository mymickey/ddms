;(function(){
  var uploadConfig =  {upload: '../fileUpload',server: ''};
  var thisHost = Core.localHost;
  var a = document.createElement('a'); a.href = uploadConfig.upload;
  var uploadHost = a.protocol + "//" + a.hostname + (a.port ? ':' + a.port : '');

  //actions
  var Actions = {
    list: '/images/',
    create: '/images/create/',

    thisHost: thisHost,
    uploadHost: uploadHost,
    serverHost: uploadConfig.server,
    uploadImage: uploadConfig.upload
  }
  var Mdl = Core.Class.Model,
    getJSON = Core.RequestHandler.getJSON,
    postJSON = Core.RequestHandler.postJSON;

  //model
  function Model(){
    var MODEL = this;
  }
  Model.prototype.create = new Mdl({
    post: function (data, callback) {
      var _this = this;
      postJSON({
        action: Actions.create,
        data: data,
        complete: function (data) {
          if (data.success) {
            _this.set(data.data);
          }
          callback && callback(data.success);
        }
      });
    }
  });
  function View(){
    var VIEW = this;
    var els = {
      uploadForm: $('#upload_form'),
      addForm: $('#add_form')
    };

    els.uploadForm.attr('action',Actions.uploadImage);

    els.addForm.on('click','button',function(){
      Core.Event.trigger('onAddImage',els.addForm.find('#link').val(),els.addForm.find('#tags').val());
    });

    this.resetAddForm = function(){
      els.addForm.find('#link').val('');
      els.addForm.find('#tags').val('');
      alert('Done!');
    }
    window.img_upload_done = function(link){
      Core.Event.trigger('onImageUpload',link,els.uploadForm.find('#tags').val());
    };
  }
  function Controller(){
    var CTRL = this;
    this.model = new Model;
    this.view = new View;

    Core.Event.on('onImageUpload',onImageUpload);
    Core.Event.on('onAddImage',onAddImage);

    function onImageUpload(link,tags){
      link = Core.localParam(link)['search']['image'];
      link = link.replace(Actions.uploadHost,Actions.serverHost);
      link = /^http/.test(link)?link:Actions.serverHost+link;

      beforePostCreate(link,tags,function(success){
        var res = CTRL.model.create.get();
        if(success && res && res.code){
          window.location = Actions.list;
        }else{
          alert('Failed!');
        }
      });
    }
    function onAddImage(link,tags){
      beforePostCreate(link,tags,CTRL.view.resetAddForm);
    }
    function beforePostCreate(link,tags,callback){
      if(link){
        var now = Core.DateHandler.getMeta(new Date()),
          dtags = [now.year+'-'+now.month+'-'+now.day];
        tags = tags || 'default';
        tags = (tags+'').trim().split(',');
        tags = tags.filter(function(key,idx,nags){
          return idx==nags.indexOf(key) && (key+'').trim();
        });
        tags = dtags.concat(tags).join(',');
        var data = {
          url: link,
          tags: tags
        };
        CTRL.model.create.post(data,callback);
      }
    }

  }
  new Controller();
}());

$(document).ready(function() {
  var form = $('#upload_form');
  form.submit(function(){
    $('#fileUpload').text('uploading')[0].disabled= true;
  })
  form.ajaxForm(function(jsonStr) {
    $('#fileUpload').text('Upload')[0].disabled =false;
    form.resetForm();
    if (typeof jsonStr =='string'){
      var json = JSON.parse(jsonStr);
      if (json.files.length){
        alert('文件上传完成'+jsonStr)
      }
    }
    console.log("Thank you for your upload!",arguments);
  });
});
