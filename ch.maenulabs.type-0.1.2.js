/**
 * Types.
 *
 * @module ch.maenulabs.type
 */
(function () {
	/* global window */
	if (!window.ch) {
		window.ch = {};
	}
	if (!window.ch.maenulabs) {
		window.ch.maenulabs = {};
	}
	if (!window.ch.maenulabs.type) {
		window.ch.maenulabs.type = {};
	}
})();

(function () {
	/* global ch */
	/**
	 * Gets a base object that will execute all methods in the instance context.
	 *
	 * @private
	 * @static
	 * @method getBase
	 *
	 * @param {Object} methods A map of methods mapped to their names
	 * @param {Object} instance The instance to execute the methods in
	 * @param {Function} getSuperMethods Gets the super methods
	 *
	 * @return {Function} A base function that return the function of the
	 *     methods with the specified name
	 */
	var getBase = function (methods, instance, getSuperMethods) {
		return function (method) {
			var currentMethods = methods;
			// build lookup chain
			var lookupChain = [];
			while (currentMethods) {
				lookupChain.push(currentMethods);
				try {
					currentMethods = getSuperMethods(currentMethods);
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
	 * A type is a factory that generates instances of it. This implementation
	 * is similar to SmallTalk classes.
	 * 
	 * Both instance and type properties can have an 'initialize' method, which
	 * is called when the instance or the type is instantiated. Each instance of
	 * a type has a 'type' property that refers its type. The type has a
	 * 'baseType' property that refers to its base type. Both an instance of a
	 * type and a type has a 'base' method, that takes a method name and returns
	 * the method of that name of the base type which will be executed in the
	 * context of the instance.
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
		baseType = baseType || Object;
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
				return thisPrototype.type.baseType.prototype;
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
