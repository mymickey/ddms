React="object"==typeof React?React:require("react"),function(w){if(document.registerElement||document.register)var registrationFunction=(document.registerElement||document.register).bind(document);var registerReact=function(e,t){var r=Object.create(HTMLElement.prototype);r.createdCallback=function(){this._content=utils.getContentNodes(this);var e=React.createElement(t,utils.getAllProperties(this,this.attributes));this.reactiveElement=React.render(e,this),utils.extend(this,this.reactiveElement),utils.getterSetter(this,"props",function(){return this.reactiveElement.props},function(e){this.reactiveElement.setProps(e)})},r.attributeChangedCallback=function(e,t,r){this.reactiveElement.props=utils.getAllProperties(this,this.attributes),this.reactiveElement.forceUpdate(),void 0!==this.reactiveElement.attributeChanged&&this.reactiveElement.attributeChanged.bind(this)(e,t,r)},registrationFunction(e,{prototype:r})},utils={extend:function(e,t){for(var r in t)r in e||(e[r]="function"==typeof t[r]?t[r].bind(t):t[r])},getContentNodes:function(e){for(var t=document.createElement("content");e.childNodes.length;)t.appendChild(e.childNodes[0]);return t},getAllProperties:function(e,t){for(var r={},n=0;n<t.length;n++){var i=t[n],a=utils.attributeNameToPropertyName(i.name);r[a]=utils.parseAttributeValue(t[n].value)}return r._content=e._content,r},attributeNameToPropertyName:function(e){return e.replace(/^(x|data)[-_:]/i,"").replace(/[-_:](.)/g,function(e,t){return t.toUpperCase()})},parseAttributeValue:function(value){var pointerRegexp=/\{.*?\}/g,jsonRegexp=/\{{.*?\}}/g,jsonArrayRegexp=/\{{.*?\}}/g,pointerMatches=value.match(pointerRegexp),jsonMatches=value.match(jsonRegexp)||value.match(jsonArrayRegexp);return jsonMatches&&jsonMatches.length>0?(jsonMatches[0]=jsonMatches[0].substring(1,jsonMatches[0].length-1).replace(/'/g,'"'),value=JSON.parse(jsonMatches[0])):pointerMatches&&pointerMatches.length>0&&(value=eval(pointerMatches[0].replace("{","").replace("}",""))),value},getterSetter:function(e,t,r,n){Object.defineProperty?Object.defineProperty(e,t,{get:r,set:n}):document.__defineGetter__&&(e.__defineGetter__(t,r),e.__defineSetter__(t,n)),e["get"+t]=r,e["set"+t]=n}};window.ReactiveElements={},window.ReactiveElements.utils=utils,document.registerReact=registerReact,"object"==typeof module&&module.exports&&(module.exports=registerReact),void 0!==w.xtag&&(w.xtag.registerReact=registerReact)}(window);