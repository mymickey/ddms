var React = require('react');
var DefaultLayout = require('../layouts/default');
var Navigation = require('../components/navigation');

module.exports = React.createClass({
  render: function () {
    var data = this.props.form;
    var cache = {
      _id:data._id,
      project:data.project,
      user:data.user,
      desc:data.desc,
      title:data.title,
      formId:data.formId,
      htmlFileName:data.htmlFileName
    }
    var htmlContent = data.htmlContent;
    var scripts = [
        '/js/components/codemirror-5.14.2/lib/codemirror.js',
        '/js/components/codemirror-5.14.2/mode/xml/xml.js',
        '/js/components/codemirror-5.14.2/mode/javascript/javascript.js',
        '/js/components/codemirror-5.14.2/mode/css/css.js',
        '/js/components/codemirror-5.14.2/mode/htmlmixed/htmlmixed.js',
        '/js/components/codemirror-5.14.2/addon/edit/matchbrackets.js',

        '/js/components/Pages.edit.js?jsx',
        '/ckeditor/ckeditor.js',
        '/ckeditor/adapters/jquery.js',
        ];
    var styles = [
        '/js/components/codemirror-5.14.2/lib/codemirror.css',
    ]      
    return (
      <DefaultLayout title="Edit Form" scripts={scripts} styles={styles}>
        <div id="wrapper">
          {/* Navigation */}
          <Navigation></Navigation>
          <div id="page-wrapper">
            <div className="row row-same-height">
              <div className="col-xs-12 col-xs-height"><h3><a href={'/pages/'+data.project}>Forms</a> / Edit page</h3></div>
              <div className="col-xs-2 col-xs-height col-middle">
                <div className="pull-right">
                  <a href={"/formdatas/"+data._id+'?page=0'} className="btn btn-default btn-circle"><i className="fa fa-database"></i></a>
                  &nbsp;&nbsp;&nbsp;&nbsp;<a href={'/forms/delete/'+data._id} className="btn btn-default btn-circle"><i
                  className="fa fa-minus"></i></a>
                </div>
              </div>
            </div>
            <div id="form-wrapper"></div>
          </div>
          <textarea id="text-htmlContent" className='hide'>{htmlContent}</textarea>
          <script dangerouslySetInnerHTML={{__html:`
            window.__formData = ${JSON.stringify(cache)};
          `}}/>
        </div>
      </DefaultLayout>
    );
  }
});
