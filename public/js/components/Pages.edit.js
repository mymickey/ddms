;(function(){
  var reloadWarning = false;
  function closeEditorWarning(){
    return reloadWarning?'Are you sure?':null;
  }
  window.onbeforeunload = closeEditorWarning;

  function handleEditor(el){
    el = $(this);
    var textarea,parent;
    parent = el.parent().parent();
    textarea = parent.find('textarea');
    textarea.ckeditor({
      uiColor: '#ffffff',
      on: {
        change: function() {
          // Sync textarea.
          this.updateElement();
          React.addons.TestUtils.Simulate.change(textarea[0]);
        }
      }
    });
    el.remove();
    parent.find('.col-xs-9').removeClass('col-xs-9').addClass('col-xs-10');
  }

  //actions
  var Actions = {
    formList: '/pages',
    update: '/pages/update',
    syncToCDN:'/pages/syncToCDN'
  }
  var Mdl = Core.Class.Model,
    getJSON = Core.RequestHandler.getJSON,
    postJSON = Core.RequestHandler.postJSON;

  //model
  function Model(){}
  Model.prototype.syncToCDN = new Mdl({
    post:function(d,callback){
      var _this = this;
      postJSON({
        action: Actions.syncToCDN,
        data: d,
        complete: function (data) {
          if (data.success) {
            _this.set(data.data);
          }
          callback && callback(data.success);
        }
      });
    }
  });
  Model.prototype.update = new Mdl({
    post: function (data, callback) {
      console.log('edit :',data);
      var _this = this;
      postJSON({
        action: Actions.update,
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
  var model = new Model;

  var Form = React.createClass({
    getDefaultProps: function() {
      var data = window.__formData || {};
      return {
        htmlFileName:data.htmlFileName
      };
    },
    getInitialState: function(){
      var data = window.__formData || {};
      return {_id: data._id,title: data.title,desc: data.desc,htmlContent:$('#text-htmlContent').text(),formId:data.formId,htmlFileName:data.htmlFileName,cdnURL:data.cdnURL}
    },
    componentDidMount: function(){
      $(this.getDOMNode()).on('click','.init-editor',handleEditor);
      var editor = CodeMirror.fromTextArea(document.querySelector('#htmlContent'), {
        lineNumbers: true,
        mode: "text/html",
        matchBrackets: true,viewportMargin:Infinity,

      });
      editor.on('change',this.onHtmlContentChange);
      this.setState({
        htmlContent:editor.getValue()
      })
    },
    onHtmlContentChange:function(htmlEditor,opt){
      reloadWarning = true;
      this.setState({
        htmlContent:htmlEditor.getValue()
      })
    },
    onHtmlFileNameChange:function(e){
      reloadWarning = true;
      this.setState({
        htmlFileName:e.target.value
      })
    },
    componentWillUnmount: function(){
      $(this.getDOMNode()).off('click','.init-editor',handleEditor);
    },
    onTitleChange: function(e){
      reloadWarning = true;
      this.setState({title: e.target.value});
    },
    onDescChange: function(e){
      reloadWarning = true;
      this.setState({desc: e.target.value});
    },
    handleAddItem: function(){
      reloadWarning = true;
      var nextItem = this.state.child.concat([{required: true}]);
      this.setState({child: nextItem});
    },
    handleItemRemove: function(index){
      reloadWarning = true;
      var r = confirm("Are you sure?");
      if (r == true) {
        var child = this.state.child;
        child.splice(index, 1);
        this.setState({child: child});
      }
    },
    handleItemChange: function(index,data){
      reloadWarning = true;
      var child = this.state.child;
      child[index] = data;
      this.setState({child: child});
    },
    handleSubmit: function(e){
      e.preventDefault();
      var data = this.state;
      if($.trim(data.formId)!='' && $.trim(data.title)!='' && $.trim(data.htmlContent)!='' &&  $.trim(data.htmlFileName) ){
        model.update.post(data,function(success){
          var res = model.update.get();
          if(success && res && res.code){
            reloadWarning = false;
            alert('Done!');
            window.location.reload();
          }else{
            alert('failed!'+ JSON.stringify(res));
          }
        });
      }else{
        alert('* is required!');
      }
    },
    handleSync:function(e){
      e.preventDefault();
      var data = this.state;
      if($.trim(data.formId)!='' && $.trim(data.title)!='' && $.trim(data.htmlContent)!='' &&  $.trim(data.htmlFileName) ){
        model.syncToCDN.post({pageid:this.state._id},function(success){
          var res = model.syncToCDN.get();
          console.log('sync to cdn :',res);
          if(success && res && res.code){
            reloadWarning = false;
            alert('Done! '+res.url);
            window.location.reload();
          }else{
            alert('failed!' + JSON.stringify(res));
          }
        });
      }else{
        alert('* is required!');
      }
    },
    onFormIdChange:function(e){
      reloadWarning = true;
      this.setState({formId: e.target.value});
    },
    render: function () {
      var hasHtmlFileName = this.props.htmlFileName && $.trim(this.props.htmlFileName).length > 0 
      return (
        <form role="form" className="form-horizontal">
          <div className="form-group">
            <label htmlFor="title" className="col-xs-2 control-label">Title*</label>
            <div className="col-xs-6">
              <input type="text" className="form-control input-sm" id="title" name="title" value={this.state.title} onChange={this.onTitleChange}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="desc" className="col-xs-2 control-label">Description</label>
            <div className="col-xs-9">
              <textarea type="text" className="form-control input-sm" ref="desc" id="desc" name="desc" rows="1" value={this.state.desc} onChange={this.onDescChange} />
            </div>
            <div className="col-xs-1">
              <button type="button" className="btn btn-default input-sm init-editor"><span className="glyphicon glyphicon-resize-full" aria-hidden="true"></span></button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="htmlFileName" className="col-xs-2 control-label">htmlFileName*</label>
            <div className="col-xs-6">
              <input type="text" className="form-control input-sm" id="htmlFileName" name="htmlFileName" disabled={hasHtmlFileName} value={this.state.htmlFileName} onChange={this.onHtmlFileNameChange}/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-xs-2 control-label">html *</label>
            <div className="col-xs-9">
              <textarea type="text" ref="htmlContent" id="htmlContent" className="hide" defaultValue={this.state.htmlContent}>

              </textarea>
            </div>  
          </div>
          <div className="form-group">
            <label htmlFor="formId" className="col-xs-2 control-label">form id *</label>
            <div className="col-xs-6">
              <input type="text" className="form-control input-sm" id="formId" name="formId" value={this.state.formId} onChange={this.onFormIdChange}/>
            </div>
          </div>
          <div className="form-group">
            <label  className="col-xs-2 control-label">cdn url</label>
            <div className="col-xs-6">
              <h4><a href={this.state.cdnURL} target="_blank">{this.state.cdnURL}</a></h4>
            </div>
          </div>
          <div className="form-group" style={{'marginTop': '10px'}}>
            <div className="col-xs-offset-2 col-xs-10 btn-group">
              <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>Submit</button>
              <button className="btn btn-default" onClick={this.handleSync}>Sync to CDN</button>
            </div>
          </div>
        </form>
      );
    }
  });
  React.render(
    <Form/>,
    document.querySelector('#form-wrapper')
  );
}());
