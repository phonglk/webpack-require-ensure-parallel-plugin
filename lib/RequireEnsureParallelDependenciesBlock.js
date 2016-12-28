/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var AsyncDependenciesBlock = require("webpack/lib/AsyncDependenciesBlock");
var RequireEnsureParallelDependency = require("./RequireEnsureParallelDependency");

function RequireEnsureParallelDependenciesBlock(expr, fnExpression, chunkName, chunkNameRange, module, loc) {
	AsyncDependenciesBlock.call(this, chunkName, module, loc);
	this.expr = expr;
	var bodyRange = fnExpression && fnExpression.body && fnExpression.body.range;
	this.range = bodyRange && [bodyRange[0] + 1, bodyRange[1] - 1] || null;
	this.chunkNameRange = chunkNameRange;
	var dep = new RequireEnsureParallelDependency(this);
	dep.loc = loc;
	this.addDependency(dep);
}
module.exports = RequireEnsureParallelDependenciesBlock;

RequireEnsureParallelDependenciesBlock.prototype = Object.create(AsyncDependenciesBlock.prototype);
RequireEnsureParallelDependenciesBlock.prototype.constructor = RequireEnsureParallelDependenciesBlock;