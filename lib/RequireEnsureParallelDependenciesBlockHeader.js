/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var AsyncDependenciesBlock = require("webpack/lib/AsyncDependenciesBlock");
var RequireEnsureParallelDependencyHeader = require("./RequireEnsureParallelDependencyHeader");

function RequireEnsureParallelDependenciesBlockHeader(expr, fnExpression, chunkName, chunkNameRange, module, loc) {
	AsyncDependenciesBlock.call(this, chunkName, module, loc);
	this.expr = expr;
	var bodyRange = fnExpression && fnExpression.body && fnExpression.body.range;
	this.range = bodyRange && [bodyRange[0] + 1, bodyRange[1] - 1] || null;
	this.chunkNameRange = chunkNameRange;
	var dep = new RequireEnsureParallelDependencyHeader(this);
	dep.loc = loc;
	this.addDependency(dep);
}
module.exports = RequireEnsureParallelDependenciesBlockHeader;

RequireEnsureParallelDependenciesBlockHeader.prototype = Object.create(AsyncDependenciesBlock.prototype);
RequireEnsureParallelDependenciesBlockHeader.prototype.constructor = RequireEnsureParallelDependenciesBlockHeader;