/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");

function RequireEnsureParallelItemDependencyHeader(request) {
	ModuleDependency.call(this, request);
}
module.exports = RequireEnsureParallelItemDependencyHeader;

RequireEnsureParallelItemDependencyHeader.prototype = Object.create(ModuleDependency.prototype);
RequireEnsureParallelItemDependencyHeader.prototype.constructor = RequireEnsureParallelItemDependencyHeader;
RequireEnsureParallelItemDependencyHeader.prototype.type = "require.ensureParallel item";

RequireEnsureParallelItemDependencyHeader.Template = require("webpack/lib/dependencies/NullDependencyTemplate");