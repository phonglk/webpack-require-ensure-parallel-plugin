/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/
var NullDependency = require("webpack/lib/dependencies/NullDependency");
var DepBlockHelpers = require("webpack/lib/dependencies/DepBlockHelpers");

var getDepBlockPromise = DepBlockHelpers.getDepBlockPromise || function(depBlock, outputOptions, requestShortener, name) {
	function asComment(str) {
		if(!str) return "";
		return "/* " + str + " */";
	}
	if(depBlock.chunks) {
		var chunks = depBlock.chunks.filter(function(chunk) {
			return !chunk.entry && typeof chunk.id === "number";
		});
		if(chunks.length === 1) {
			var chunk = chunks[0];
			return "__webpack_require__.e" + asComment(name) + "(" + chunk.id + "" +
				(outputOptions.pathinfo && depBlock.chunkName ? "/*! " + requestShortener.shorten(depBlock.chunkName) + " */" : "") +
				asComment(depBlock.chunkReason) + ")";
		}
	}
	return "Promise.resolve()";
};

function RequireEnsureParallelDependency(block) {
	NullDependency.call(this);
	this.block = block;
}
module.exports = RequireEnsureParallelDependency;

RequireEnsureParallelDependency.prototype = Object.create(NullDependency.prototype);
RequireEnsureParallelDependency.prototype.constructor = RequireEnsureParallelDependency;
RequireEnsureParallelDependency.prototype.type = "require.ensureParallel";

RequireEnsureParallelDependency.Template = function RequireEnsureParallelDependencyTemplate() {};

RequireEnsureParallelDependency.Template.prototype.apply = function(dep, source, outputOptions, requestShortener) {
	var depBlock = dep.block;
	var ensureRequest = getDepBlockPromise(depBlock, outputOptions, requestShortener, /* require.e */ "nsure(parallel)");
	source.replace(depBlock.itemRange[0], depBlock.itemRange[1] - 1, ensureRequest);
};
