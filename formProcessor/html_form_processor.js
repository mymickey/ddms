var index = require('htmlprocessor/index');
var htmlprocessor = require('htmlprocessor');
var path = require('path')
// Replace passed block with the processed content
htmlprocessor.prototype._replace = function (block, content, filePath) {
  var blockLine = this._getBlockLine(block);
  var blockContent = this._getBlockContent(block);
  var args = [content, block, blockLine, blockContent, filePath,this.options.c_content];
  var result = this._blockTypes[block.type].apply(this, args);

  return result;
};

exports.processHTMLForm = function(filepath , dest,form_content){
	return new index({
		src:[filepath],
		dest:dest
	},{
		customBlockTypes:[path.join(__dirname,'./custom_form_blocktype')],
		c_content:form_content
	});
}
