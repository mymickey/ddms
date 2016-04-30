var React = require('react');
var DefaultLayout = require('../layouts/default');
var Navigation = require('../components/navigation');

module.exports = React.createClass({
  render: function () {
    var data = this.props.project;
    var scripts = [
        '/js/components/codemirror-5.14.2/lib/codemirror.js',
        '/js/components/codemirror-5.14.2/mode/xml/xml.js',
        '/js/components/codemirror-5.14.2/mode/javascript/javascript.js',
        '/js/components/codemirror-5.14.2/mode/css/css.js',
        '/js/components/codemirror-5.14.2/mode/htmlmixed/htmlmixed.js',
        '/js/components/codemirror-5.14.2/addon/edit/matchbrackets.js',

        '/js/components/Page.add.js?jsx',
        '/ckeditor/ckeditor.js',
        '/ckeditor/adapters/jquery.js',
        ];
    var styles = [
        '/js/components/codemirror-5.14.2/lib/codemirror.css',
    ]    
    return (
      <DefaultLayout title="Create Form" scripts={scripts} styles={styles}>
        <div id="wrapper">
          {/* Navigation */}
          <Navigation></Navigation>
          <div id="page-wrapper">
            <div className="row row-same-height">
              <div className="col-xs-12 col-xs-height"><h3><a href={'/pages/'+data._id}>Pages</a> / Create a new page</h3></div>
            </div>
            <div id="form-wrapper"></div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{__html:`
            window.__projectData = ${JSON.stringify(data)};
          `}}/>
      </DefaultLayout>
    );
  }
});
