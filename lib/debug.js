module.exports = {
  getLogger: function() {
    if (typeof log !== 'undefined') {
      /*

this piece of code use to be in the start of webpack/bin/wepack.js for debugging purpuse

var path = require("path");

global.log = function (msg) {
	var origPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack;
  var err = new Error()
	var extras = '';
  var stack = err.stack
  Error.prepareStackTrace = origPrepareStackTrace
	var shift = this.shift || 1;
	var params = Array.prototype.slice.call(arguments, 0);
	if (this.extras) {
		extras = this.extras(stack);
		params.push(extras);
	}
	const s = stack[shift];
	const prefix = `${s.getFileName().replace(path.join(__dirname, '../../'), '')}:${s.getFunctionName()}:${s.getLineNumber()}`;
	console.log.apply(null, [log.indent(), prefix+' --'].concat(params));
}

global.log._indent = 0;
global.log.indent = function() {
	var out = '';
	for(var i=0; i < global.log._indent; i++) out += ' ';
	return out;
}
global.log.p = function(p, level='../../../') {
	return p ? p.replace(path.join(__dirname, level), '') : 'empty';
}
      */
      return log;
    } else {
      return function(){return;};
    }
  }
}