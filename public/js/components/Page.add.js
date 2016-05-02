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
    formList: '/pages/'+window.__projectData._id,
    create: '/pages/create/'+window.__projectData._id
  }
  var Mdl = Core.Class.Model,
    getJSON = Core.RequestHandler.getJSON,
    postJSON = Core.RequestHandler.postJSON;

  //model
  function Model(){}
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
  var model = new Model;


  
  
  

  var Form = React.createClass({
    getInitialState: function(){
      return {title:'',desc: '',htmlContent:'',htmlFileName:''}
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
    
    
    handleSubmit: function(e){
      e.preventDefault();
      var data = this.state;
      if($.trim(data.title)!='' && $.trim(data.htmlFileName) && $.trim(data.htmlContent)!=''){
        console.log('submit data',data);
        //return;
        model.create.post(data,function(success){
          var res = model.create.get();
          if(success && res && res.code){
            reloadWarning = false;
            window.location = Actions.formList;
          }else{
            alert('failed!'+JSON.stringify(res));
          }
        });
      }else{
        alert('* is required!');
      }
    },
    render: function () {
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
              <input type="text" className="form-control input-sm" id="htmlFileName" name="htmlFileName" value={this.state.htmlFileName} onChange={this.onHtmlFileNameChange}/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-xs-2 control-label">html</label>
            <div className="col-xs-9">
              <textarea type="text" ref="htmlContent" id="htmlContent" className="hide" defaultValue=''>

              </textarea>
            </div>  
          </div>
          <div className="form-group" style={{'marginTop': '10px'}}>
            <div className="col-xs-offset-2 col-xs-10 btn-group">
              <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>Submit</button>
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
