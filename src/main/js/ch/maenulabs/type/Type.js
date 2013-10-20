(function () {
	/* global ch */
	/**
	 * Gets a base object that will execute all methods in the instance context.
	 *
	 * @private
	 * @method getBase
	 *
	 * @param {Object} methods A map of methods mapped to their names
	 * @param {Object} instance The instance to execute the methods in
	 * @param {Function} getSuper Gets the super methods
	 *
	 * @return {Function} A base function that return the function of the
	 *     methods with the specified name
	 */
	var getBase = function (methods, instance, getSuper) {
		return function (method) {
			var currentMethods = methods;
			// build lookup chain
			var lookupChain = [];
			while (currentMethods) {
				lookupChain.push(currentMethods);
				try {
					currentMethods = getSuper(currentMethods);
				} catch (error) {
					// hit rock bottom
					break;
				}
			}
			// determine position in lookup chain
			while (lookupChain.shift()[method] != arguments.callee.caller) {
				// traverse
			}
			currentMethods = lookupChain.shift();
			// find method
			while (!currentMethods[method]) {
				currentMethods = lookupChain.shift();
			}
			return function () {
				return currentMethods[method].apply(instance, arguments);
			};
		};
	};
	/**
	 * Creates a type.
	 *
	 * @constructor
 	 * @class Type
	 *
	 * @param {Function} [baseType=Object] The base type
	 * @param {Object} [instanceProperties={}] The instance properties
	 * @param {Object} [typeProperties={}] The type properties
	 */
	ch.maenulabs.type.Type = function (baseType, instanceProperties,
			typeProperties) {
		// set to default values if necessary
		baseType = baseType || Object;
		instanceProperties = instanceProperties || {};
		typeProperties = typeProperties || {};
		// the instance constructor
		var instanceConstructor = instanceProperties.initialize;
		if (!instanceConstructor) {
			if (baseType.initialize) {
				instanceConstructor = function () {
					return baseType.prototype.initialize.apply(this,
							arguments);
				};
			} else {
				instanceConstructor = baseType;
			}
		}
		var type = function () {
			this.base = getBase(this, this, function (thisPrototype) {
				return thisPrototype.baseType.prototype;
			});
			instanceConstructor.apply(this, arguments);
		};
		// copy instance properties
		type.prototype = Object.create(baseType.prototype);
		// set instance properties
		// default initialize, may be overridden
		type.prototype.initialize = instanceConstructor;
		for (var instanceProperty in instanceProperties) {
			if (instanceProperties.hasOwnProperty(instanceProperty)) {
				type.prototype[instanceProperty] = instanceProperties[
						instanceProperty];
			}
		}
		type.prototype.constructor = type;
		type.prototype.type = type;
		type.prototype.baseType = baseType;
		// the type constructor
		var typeConstructor = typeProperties.initialize;
		if (!typeConstructor) {
			if (baseType.initialize) {
				typeConstructor = function () {
					return baseType.initialize.apply(this, arguments);
				};
			} else {
				typeConstructor = function () {};
			}
		}
		// copy base type properties
		for (var baseTypeProperty in baseType) {
			if (baseType.hasOwnProperty(baseTypeProperty)) {
				type[baseTypeProperty] = baseType[baseTypeProperty];
			}
		}
		// set type properties
		for (var typeProperty in typeProperties) {
			if (typeProperties.hasOwnProperty(typeProperty)) {
				type[typeProperty] = typeProperties[typeProperty];
			}
		}
		type.baseType = baseType;
		type.initialize = typeConstructor;
		(function () {
			this.base = getBase(this, this, function (thisType) {
				return thisType.baseType;
			});
			typeConstructor.apply(this, arguments);
		}).apply(type, []);
		return type;
	};
})();