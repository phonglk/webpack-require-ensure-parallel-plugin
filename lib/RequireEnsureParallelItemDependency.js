/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");

function RequireEnsureParallelItemDependency(request) {
	ModuleDependency.call(this, request);
}
module.exports = RequireEnsureParallelItemDependency;

RequireEnsureParallelItemDependency.prototype = Object.create(ModuleDependency.prototype);
RequireEnsureParallelItemDependency.prototype.constructor = RequireEnsureParallelItemDependency;
RequireEnsureParallelItemDependency.prototype.type = "require.ensureParallel item";

RequireEnsureParallelItemDependency.Template = require("webpack/lib/dependencies/NullDependencyTemplate");