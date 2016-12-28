/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Le Khoi-Phong @phonglk
	Modified from webpack's source code of Tobias Koppers @sokra
*/

var log = require('./debug').getLogger();

var AbstractPlugin = require("webpack/lib/AbstractPlugin");
var RequireEnsureParallelDependenciesBlock = require("./RequireEnsureParallelDependenciesBlock");
var RequireEnsureItemDependency = require("./RequireEnsureParallelItemDependency");
var RequireEnsureParallelDependenciesBlockHeader = require("./RequireEnsureParallelDependenciesBlockHeader");
var RequireEnsureItemDependencyHeader = require("./RequireEnsureParallelItemDependencyHeader");
var getFunctionExpression = require("webpack/lib/dependencies/getFunctionExpression");

module.exports = AbstractPlugin.create({
	"call require.ensureParallel": function(expr) {
		var chunkName = null,
			chunkNameRange = null;
		switch(expr.arguments.length) {
			case 3:
				var chunkNameExpr = this.evaluateExpression(expr.arguments[2]);
				if(!chunkNameExpr.isString()) return;
				chunkNameRange = chunkNameExpr.range;
				chunkName = chunkNameExpr.string;
				// falls through
			case 2:
				var dependenciesExpr = this.evaluateExpression(expr.arguments[0]);
				var dependenciesItems = dependenciesExpr.isArray() ? dependenciesExpr.items : [dependenciesExpr];
				var fnExpressionArg = expr.arguments[1];
				var fnExpression = getFunctionExpression(fnExpressionArg);

				log('[PARALLEL] dependenciesItems: ', dependenciesItems.length, dependenciesItems.map(dep => dep.string).join(', '), ' <-- ', chunkName);

				if(fnExpression) {
					this.walkExpressions(fnExpression.expressions);
				}
				
				var headerBlockDep = new RequireEnsureParallelDependenciesBlockHeader(expr, fnExpression ? fnExpression.fn : fnExpressionArg, chunkName, chunkNameRange, this.state.module, expr.loc);
				var firstDep = dependenciesItems[0];
				var headerDep = new RequireEnsureItemDependencyHeader(firstDep.string, firstDep.range);
				headerDep.loc = headerBlockDep.loc;
				headerBlockDep.addDependency(headerDep);
				this.state.current.addBlock(headerBlockDep);
				
				dependenciesItems.forEach(function (dependenciesItem, i) {
					var cname = chunkName ? chunkName+'-' + i : null; // let webpack decide name of chunkName is not specified
					var dep = new RequireEnsureParallelDependenciesBlock(expr, fnExpression ? fnExpression.fn : fnExpressionArg, cname , chunkNameRange, this.state.module, expr.loc);
					var old = this.state.current;
					this.state.current = dep;
					try {
						var failed = false;
						this.inScope([], function() {
							var ee = dependenciesItem;
							if(ee.isString()) {
								var edep = new RequireEnsureItemDependency(ee.string, ee.range);
								dep.itemRange = ee.range; // passing range of item to block
								edep.loc = dep.loc;
								dep.addDependency(edep);
							} else {
								failed = true;
							}
						});
						if(failed) {
							return;
						}
						if(fnExpression) {
							if(fnExpression.fn.body.type === "BlockStatement")
								this.walkStatement(fnExpression.fn.body);
							else
								this.walkExpression(fnExpression.fn.body);
						}
						old.addBlock(dep);
					} finally {
						this.state.current = old;
					}
				}.bind(this));
				if(!fnExpression) {
					this.walkExpression(fnExpressionArg);
				}
				log('[PARALLEL] end', chunkName);
				return true;
		}
	}
});
