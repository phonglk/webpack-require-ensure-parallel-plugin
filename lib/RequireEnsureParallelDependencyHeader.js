/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var NullDependency = require("webpack/lib/dependencies/NullDependency");

function RequireEnsureParallelDependencyHeader(block) {
	NullDependency.call(this);
	this.block = block;
}
module.exports = RequireEnsureParallelDependencyHeader;

RequireEnsureParallelDependencyHeader.prototype = Object.create(NullDependency.prototype);
RequireEnsureParallelDependencyHeader.prototype.constructor = RequireEnsureParallelDependencyHeader;
RequireEnsureParallelDependencyHeader.prototype.type = "require.ensureParallel";

RequireEnsureParallelDependencyHeader.Template = function RequireEnsureParallelDependencyHeaderTemplate() {};

RequireEnsureParallelDependencyHeader.Template.prototype.apply = function(dep, source, outputOptions, requestShortener) {
	var depBlock = dep.block;
	source.replace(depBlock.expr.range[0], depBlock.expr.arguments[0].range[0] - 1, "Promise.all(");
	source.replace(depBlock.expr.arguments[0].range[1], depBlock.expr.arguments[1].range[0] - 1, ").then((");
	source.replace(depBlock.expr.arguments[1].range[1], depBlock.expr.range[1] - 1, ").bind(null, __webpack_require__)).catch(__webpack_require__.oe || function(err) { console.error(err); throw err; })");
};
