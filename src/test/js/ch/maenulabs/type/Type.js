/* global ch, describe, it, beforeEach, expect, jasmine */
describe('Type', function () {

	var Type = null;

	beforeEach(function () {
		Type = ch.maenulabs.type.Type;
	});

	describe('constructor contract', function () {

		it('should be possible to create a type without base type '
				+ '& instance properties & type properties', function () {
			expect(function () {
				return new Type();
			}).not.toThrow();
		});

		it('should be possible to create a type without instance properties '
				+ '& type properties', function () {
			expect(function () {
				return new Type(Date);
			}).not.toThrow();
		});

		it('should be possible to create a type without type properties',
				function () {
			expect(function () {
				return new Type(Date, {});
			}).not.toThrow();
		});

		it('should be possible to create a type', function () {
			expect(function () {
				return new Type(Date, {}, {});
			}).not.toThrow();
		});

	});

	describe('creation', function () {

		describe('without base type, without instance properties, '
				+ 'without type properties', function () {

			var A = null;

			beforeEach(function () {
				A = new Type();
			});

			it('should subtype Object', function () {
				expect(A.baseType).toBe(Object);
			});

			it('should have a default type constructor', function () {
				expect(A.initialize instanceof Function).toBeTruthy();
			});

			it('should have a default instance constructor', function () {
				expect(function () {
					return new A();
				}).not.toThrow();
			});

			describe('instance', function () {

				var a = null;

				beforeEach(function () {
					a = new A();
				});

				it('should set type to the type of the object', function () {
					expect(a.type).toBe(A);
				});

				it('should be an instance of the type', function () {
					expect(a instanceof A).toBeTruthy();
					expect(a instanceof a.type).toBeTruthy();
				});

				it('should set base type of the object to the base type '
						+ 'of the type', function () {
					expect(a.type.baseType).toBe(A.baseType);
				});

			});

		});

		describe('with base type, without instance properties, '
				+ 'without type properties', function () {

			var A = null;

			beforeEach(function () {
				A = new Type(Date);
			});

			it('should subtype Date', function () {
				expect(A.baseType).toBe(Date);
			});

		});

		describe('with base type, with instance properties, '
				+ 'without type properties', function () {

			it('should override instance constructor', function () {
				var A = new Type(Date, {
					initialize: function (value) {
						this.value = value;
					}
				});
				var value = 1;
				var a = new A(value);
				expect(a.value).toEqual(value);
			});

			it('should have a default instance constructor', function () {
				var A = new Type(Date, {
					getValue: function () {
						return this.value;
					},
					setValue: function (value) {
						this.value = value;
					}
				});
				var a = new A();
				expect(a.initialize instanceof Function).toBeTruthy();
			});

			it('should have instance properties', function () {
				var A = new Type(Date, {
					getValue: function () {
						return this.value;
					},
					setValue: function (value) {
						this.value = value;
					}
				});
				var a = new A();
				expect(a.getValue).toBeDefined();
				expect(a.setValue).toBeDefined();
				var value = 1;
				a.setValue(value);
				expect(a.getValue()).toBe(value);
				expect(a.value).toBe(value);
			});

		});

		describe('with base type, with instance properties, '
				+ 'with type properties', function () {

			it('should override type constructor', function () {
				var value = 1;
				var A = new Type(Date, {}, {
					initialize: function () {
						this.value = value;
					}
				});
				expect(A.value).toBe(value);
			});

			it('should have a default type constructor', function () {
				var A = new Type(Date, {}, {
					getValue: function () {
						return this.value;
					},
					setValue: function (value) {
						this.value = value;
					}
				});
				expect(A.initialize instanceof Function).toBeTruthy();
			});

			it('should have type properties', function () {
				var value = 1;
				var A = new Type(Date, {}, {
					value: value,
					getType: function () {
						return this;
					}
				});
				expect(A.value).toBe(value);
				expect(A.getType()).toBe(A);
			});

		});

	});

	describe('inheritance', function () {

		var A = null;
		var B = null;

		beforeEach(function () {
			A = new Type(Date, {
				initialize: function (value) {
					this.value = value;
				},
				getValue: function () {
					return this.value;
				},
				setValue: function (value) {
					this.value = value;
				}
			}, {
				value: 1,
				getValue: function () {
					return this.value;
				}
			});
			B = new Type(A, {
				getValue: function () {
					return 2 * this.base('getValue')();
				}
			}, {
				value: 2,
				getValue: function () {
					return 2 * this.base('getValue')();
				}
			});
		});

		it('should be an instance of its base type', function () {
			var b = new B();
			expect(b instanceof A).toBeTruthy();
		});

		describe('instance properties', function () {

			var b = null;

			beforeEach(function () {
				b = new B(3);
			});

			it('should inherit the explicit base constructor', function () {
				var value = 3;
				var b = new B(value);
				expect(b.value).toBe(value);
			});

			it('should inherit the implicit base constructor', function () {
				var value = 3;
				var C = new Type(B);
				var c = new C(value);
				expect(c.value).toBe(value);
			});

			it('should inherit properties', function () {
				expect(b.getValue).toBeDefined();
				expect(b.setValue).toBeDefined();
			});

			it('should override properties', function () {
				var value = 4;
				b.setValue(value);
				expect(b.value).toBe(value);
				expect(b.getValue()).toEqual(2 * value);
			});

		});

		describe('type properties', function () {

			it('should inherit the explicit base constructor', function () {
				var context = null;
				var initialize = jasmine.createSpy().andCallFake(function () {
					context = this;
				});
				var C = new Type(Date, {}, {
					initialize: initialize
				});
				expect(initialize).toHaveBeenCalled();
				expect(context).toBe(C);
				initialize.reset();
				context = null;
				var D = new Type(C);
				expect(initialize).toHaveBeenCalled();
				expect(context).toBe(D);
			});

			it('should inherit the implicit base constructor', function () {
				var C = new Type(Date);
				var context = null;
				C.initialize = jasmine.createSpy().andCallFake(function () {
					context = this;
				});
				var D = new Type(C);
				expect(C.initialize).toHaveBeenCalled();
				expect(context).toBe(D);
			});

			it('should inherit properties', function () {
				expect(B.getValue).toBeDefined();
				expect(B.value).toBeDefined();
			});

			it('should override properties', function () {
				expect(B.value).toEqual(2);
				expect(B.getValue()).toEqual(2 * A.getValue.apply(B, []));
			});

		});

		describe('complex inheritance', function () {

			var C = null;

			beforeEach(function () {
				A = new Type(Date, {
					initialize: function () {
						this.count = 1;
					}
				}, {
					initialize: function () {
						this.count = 1;
					}
				});
				B = new Type(A, {
					initialize: function () {
						this.base('initialize')();
						this.count = this.count + 1;
					}
				}, {
					initialize: function () {
						this.base('initialize')();
						this.count = this.count + 1;
					}
				});
				C = new Type(B, {
					initialize: function () {
						this.base('initialize')();
						this.count = this.count + 1;
					}
				}, {
					initialize: function () {
						this.base('initialize')();
						this.count = this.count + 1;
					}
				});
			});

			it('should have the correct instance counts', function () {
				var a = new A();
				var b = new B();
				var c = new C();
				expect(a.count).toEqual(1);
				expect(b.count).toEqual(2);
				expect(c.count).toEqual(3);
			});

			it('should have the correct type counts', function () {
				expect(A.count).toEqual(1);
				expect(B.count).toEqual(2);
				expect(C.count).toEqual(3);
			});

		});

		describe('very complex inheritance', function () {

			var C = null;
			var D = null;
			var E = null;

			beforeEach(function () {
				A = new Type(Object, {
					act: function () {
						this.a = true;
					}
				});
				B = new Type(A, {
					act: function () {
						this.base('act')();
						this.b = true;
					}
				});
				C = new Type(B, {});
				D = new Type(C, {
					act: function () {
						this.base('act')();
						this.d = true;
					}
				});
				E = new Type(D, {
					act: function () {
						this.base('act')();
						this.e = true;
					}
				});
			});

			it('should work', function () {
				var instance = new E();
				instance.act();
				expect(instance.a).toBeDefined();
				expect(instance.b).toBeDefined();
				expect(instance.d).toBeDefined();
				expect(instance.e).toBeDefined();
			});

		});

	});

});