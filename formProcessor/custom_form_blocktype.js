'use strict';

module.exports = function (processor) {
  // This will allow to use this <!-- build:customBlock[:target] <value> --> syntax
  processor.registerBlockType('form', function (content, block, blockLine, blockContent,filepath,c_content) {
    var title = '<!-- build:form --><script>window.__formData = ' + (c_content || block.asset) + '</script><!-- /build -->';
    var result = content.replace(blockLine, title);

    return result;
  });
};