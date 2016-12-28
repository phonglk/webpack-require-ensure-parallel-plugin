/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Webpack's Author Tobias Koppers @sokra
	Plugin's Author Le Khoi Phong @phonglk
	
	Largely based on existing require.ensure handling
*/

var log = require('./debug').getLogger();

// reuse require.ensure deps
var RequireEnsureParallelItemDependency = require("./RequireEnsureParallelItemDependency");
var RequireEnsureParallelDependency = require("./RequireEnsureParallelDependency");

var RequireEnsureParallelItemDependencyHeader = require("./RequireEnsureParallelItemDependencyHeader");
var RequireEnsureParallelDependencyHeader = require("./RequireEnsureParallelDependencyHeader");

var ConstDependency = require("webpack/lib/dependencies/ConstDependency");
var NullFactory = require("webpack/lib/NullFactory");
var BasicEvaluatedExpression = require("webpack/lib/BasicEvaluatedExpression");
// modified parser
var RequireEnsureParallelDependenciesBlockParserPlugin = require("./RequireEnsureParallelDependenciesBlockParserPlugin");
var RequireEnsureParallelDependenciesBlock = require('./RequireEnsureParallelDependenciesBlock');
// end deps

function RequireEnsureParallelPlugin(options) {
	// possible options:
	// webpack: 1/2/undefined
	this.options = options;
}
module.exports = RequireEnsureParallelPlugin;

RequireEnsureParallelPlugin.prototype.apply = function(compiler) {
	var isWebpack1;
	if (this.options && this.options.webpack) {
		isWebpack1 = this.options.webpack === 1;
	} else {
		isWebpack1 = typeof compiler.options.module.rules === 'undefined';
	}

	compiler.plugin("compilation", function(compilation, params) {
		// handle require.ensureParallel
		var normalModuleFactory = params.normalModuleFactory;
		log('apply RequireEnsireParallelPlugin')
		compilation.dependencyFactories.set(RequireEnsureParallelItemDependency, normalModuleFactory);
		compilation.dependencyTemplates.set(RequireEnsureParallelItemDependency, new RequireEnsureParallelItemDependency.Template());

		compilation.dependencyFactories.set(RequireEnsureParallelDependency, new NullFactory());
		compilation.dependencyTemplates.set(RequireEnsureParallelDependency, new RequireEnsureParallelDependency.Template());

		compilation.dependencyFactories.set(RequireEnsureParallelItemDependencyHeader, normalModuleFactory);
		compilation.dependencyTemplates.set(RequireEnsureParallelItemDependencyHeader, new RequireEnsureParallelItemDependencyHeader.Template());

		compilation.dependencyFactories.set(RequireEnsureParallelDependencyHeader, new NullFactory());
		compilation.dependencyTemplates.set(RequireEnsureParallelDependencyHeader, new RequireEnsureParallelDependencyHeader.Template());

		if(!isWebpack1) {
			params.normalModuleFactory.plugin("parser", function(parser, parserOptions) {

				if(typeof parserOptions.requireEnsure !== "undefined" && !parserOptions.requireEnsure)
					return;

				parser.apply(new RequireEnsureParallelDependenciesBlockParserPlugin());
				parser.plugin("evaluate typeof require.ensureParallel", function(expr) {
					log("evaluate typeof require.ensureParallel");
					return new BasicEvaluatedExpression().setString("function").setRange(expr.range);
				});
				parser.plugin("typeof require.ensureParallel", function(expr) {
					log("typeof require.ensureParallel");
					var dep = new ConstDependency("'function'", expr.range);
					dep.loc = expr.loc;
					this.state.current.addDependency(dep);
					return true;
				});
			});
		}

		// handle optimisation: remove parents's modules from chunk
		compilation.plugin(["optimize-chunks", "optimize-extracted-chunks"], function(chunks) {
			log(`remove parents's modules`)
			chunks.forEach(function(chunk) {
				// check if chunk is parallel ?
				if (!hasEnsureParallelParents(chunk)) return;
				var cache = {};
				chunk.modules.slice().forEach(function(module) {
					if(chunk.parents.length === 0) return;
					var dId = "$" + debugIds(module.chunks);
					var parentChunksWithModule;
					if((dId in cache) && dId !== "$no") {
						parentChunksWithModule = cache[dId];
					} else {
						// anyHaveModule ??
						// check if module is in any parallel parents
						parentChunksWithModule = cache[dId] = anyHasModule(chunk.parents, module);
					}
					if(parentChunksWithModule && parentChunksWithModule.length > 0) {
						module.rewriteChunkInReasons(chunk, parentChunksWithModule);
						chunk.removeModule(module);
					}
				});
				log(`chunk ${chunk.name} finish resolve parallel parents`);
				removeDuplicatedRequireDeps(chunk);
			});
		});
	});

	if (isWebpack1) {
		new RequireEnsureParallelDependenciesBlockParserPlugin().apply(compiler.parser);
		compiler.parser.plugin("evaluate typeof require.ensureParallel", function(expr) {
			return new BasicEvaluatedExpression().setString("function").setRange(expr.range);
		});
		compiler.parser.plugin("typeof require.ensureParallel", function(expr) {
			var dep = new ConstDependency("'function'", expr.range);
			dep.loc = expr.loc;
			this.state.current.addDependency(dep);
			return true;
		});
	}
};

function removeDuplicatedRequireDeps(chunk) {
	if (chunk.parents.length > 1) {
		var hadRequireDep = false;
		for(var i=0; i < chunk.parents.length; i++) {
			var parentBlocks = chunk.parents[i].blocks;
			for(var j=0; j < parentBlocks.length; j++) {
				if (parentBlocks[j] instanceof RequireEnsureParallelDependenciesBlock)	{
					if(hadRequireDep) {
						parentBlocks[j].blocks[0].dependencies = [];
					} else {
						if (parentBlocks[j].blocks[0].dependencies.length > 0) hadRequireDep = true;
					}
					log(`remove deps of ${parentBlocks[j].blocks[0].chunkName}`)
				}
			}
		}
	}
}

function hasEnsureParallelParents(chunk) {
	for(var i = 0; i < chunk.parents.length; i ++) {
		if (!hasEnsureParallelBlocks(chunk.parents[i])) {
			return false;
		}
	}
	return true;
}

function hasEnsureParallelBlocks(chunk) {
	for(var i = 0; i < chunk.blocks.length; i ++) {
		if (chunk.blocks[i] instanceof RequireEnsureParallelDependenciesBlock === false) {
			return false;
		}
	}
	return true;
}

function anyHasModule(someChunks, module, checkedChunks) {
	if(!checkedChunks) checkedChunks = [];
	var chunks = [];
	for(var i = 0; i < someChunks.length; i++) {
		checkedChunks.push(someChunks[i]);
		var subChunks = hasModule(someChunks[i], module, checkedChunks);
		if(subChunks && subChunks.length > 0) {
			log(`module ${module.rawRequest} is in parents of ${someChunks[i].name}`)
			addToSet(chunks, subChunks);
		}
	}
	return chunks;
}

function debugIds(chunks) {
	var list = chunks.map(function(chunk) {
		return chunk.debugId;
	});
	var debugIdMissing = list.some(function(dId) {
		return typeof dId !== "number";
	});
	if(debugIdMissing)
		return "no";
	list.sort();
	return list.join(",");
}

function chunkContainsModule(chunk, module) {
	var chunks = module.chunks;
	var modules = chunk.modules;
	if(chunks.length < modules.length) {
		return chunks.indexOf(chunk) >= 0;
	} else {
		return modules.indexOf(module) >= 0;
	}
}

function hasModule(chunk, module, checkedChunks) {
	if(chunkContainsModule(chunk, module)) return [chunk];
	if(chunk.parents.length === 0) return false;
	return anyHasModule(chunk.parents.filter(function(c) {
		return checkedChunks.indexOf(c) < 0;
	}), module, checkedChunks);
}

function addToSet(set, items) {
	items.forEach(function(item) {
		if(set.indexOf(item) < 0)
			set.push(item);
	});
}