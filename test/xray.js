describe("xray.js", function() {

    // define a simple object to test with
    var testObject = {
        propA: "valA",
        propB: "valB",
        propC: "valC",
        arrayA: [ 0, 1, 2, 3, { nestedObjectProp: "valA" } ],
        someKey: "valD"
    };

    it("should be a function", function() {
        expect(typeof xray).toBe("function");
    });

    describe("max depth option", function() {
        it("should be off by default", function() {
            var paths = xray(testObject, "valA");
            expect(paths.length).toBe(2);
            expect(paths[0]).toBe('$.propA');
            expect(paths[1]).toBe('$.arrayA[4].nestedObjectProp');
        });
        it("should be off if zero is specified as value", function() {
            var paths = xray(testObject, "valA", { max_depth: 0 });
            expect(paths.length).toBe(2);
            expect(paths[0]).toBe('$.propA');
            expect(paths[1]).toBe('$.arrayA[4].nestedObjectProp');
        });
        it("should respect a non-zero value", function() {
            var paths = xray(testObject, "valA", { max_depth: 1});
            expect(paths.length).toBe(1);
            expect(paths[0]).toBe('$.propA');
        });
    });

    describe("scan keys option", function() {
        it("shouldn't scan keys by default", function() {
            var paths = xray(testObject, "propA");
            expect(paths.length).toBe(0);
        });
        it("should scan keys if enabled", function() {
            var paths = xray(testObject, "propA", { scan_keys: true });
            expect(paths.length).toBe(1);
            expect(paths[0]).toBe("$.propA");
        });
    });

    describe("query parameter", function() {
        it("should accept a regular string", function() {
            expect(function() {
                xray(testObject, "valA");
            }).not.toThrow();
        });
        it("should accept a RegExp object", function() {
            expect(function() {
                xray(testObject, /valA/);
            }).not.toThrow();
        });
        it("should accept a function", function() {
            expect(function() {
                xray(testObject, function(value) { return false; });
            }).not.toThrow();
        });
        it("should throw an exception if anything else is passed as a query", function() {
            var errorRegExp = new Error("Query parameter must be a string, RegExp object, or function");
            expect(function() { xray(testObject, {}); }).toThrow(errorRegExp);
            expect(function() { xray(testObject, []); }).toThrow(errorRegExp);
            expect(function() { xray(testObject, 2); }).toThrow(errorRegExp);
            expect(function() { xray(testObject, false); }).toThrow(errorRegExp);
        });
    });

    describe("prototype properties", function() {
        it("should find properties part of the parent prototype", function() {

            var GrandParent = Class.extend({ grandParentProperty: "grandparent value" });
            var Parent = GrandParent.extend({ parentProperty: "parent value" });
            var Child = Parent.extend({ childProperty: "child value" });
            var child = new Child();

            var paths = xray(child, "value");
            expect(paths.length).toBe(3);
            expect(paths[0]).toBe("$.childProperty");
            expect(paths[1]).toBe("$.parentProperty");
            expect(paths[2]).toBe("$.grandParentProperty");

            paths = xray(child, /property/i, { scan_keys: true });
            expect(paths.length).toBe(3);
        });
    });

	describe("cusomter scanner function", function() {

		var scanner;
		beforeEach(function() {
			scanner = jasmine.createSpy("scanner");
		});

		it("should be informed of the path being scanned", function() {

			var object = { prop: [ 1, 2, "3", { subPro: "ha" } ] };
			xray(object, scanner);

			expect(scanner.mostRecentCall.args[1].path).toEqual("$.prop[3].subPro");
		});


		it("should be informed if a key is being scanned", function() {

			var object = { someKey: "someValue" };

			xray(object, scanner, { scan_keys: true });
			expect(scanner.calls.length).toEqual(2);

			var args = scanner.calls[0].args;
			expect(args[0]).toBe("someKey");
			expect(args[1].isKey).toBe(true);

			args = scanner.calls[1].args;
			expect(args[0]).toBe("someValue");
			expect(args[1].isKey).toBe(false);
		});
	});

});
