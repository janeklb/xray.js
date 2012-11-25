var testObject = {

        propA: "valA",
        propB: "valB",
        propC: "valC",
        arrayA: [
                0, 1, 2, 3, {
                    nestedObjectProp: "valA"
                }
        ],
        someKey: "valD"
};

describe("xray.js", function() {

    it("should be a function available in the global/window scope", function() {
        expect(window.xray).to.be.a("function");
    });

    describe("max depth option", function() {
        it("should be off by default", function() {
            var paths = xray(testObject, "valA");
            expect(paths.length).to.be(2);
            expect(paths[0]).to.be('o.propA');
            expect(paths[1]).to.be('o.arrayA[4].nestedObjectProp');
        });
        it("should be off if zero is specified as value", function() {
            var paths = xray(testObject, "valA", { max_depth: 0 });
            expect(paths.length).to.be(2);
            expect(paths[0]).to.be('o.propA');
            expect(paths[1]).to.be('o.arrayA[4].nestedObjectProp');
        });
        it("should respect a non-zero value", function() {
            var paths = xray(testObject, "valA", { max_depth: 1});
            expect(paths.length).to.be(1);
            expect(paths[0]).to.be('o.propA');
        });
    });

    describe("scan keys option", function() {
        it("shouldn't scan keys by default", function() {
            var paths = xray(testObject, "propA");
            expect(paths.length).to.be(0);
        });
        it("should scan keys if enabled", function() {
            var paths = xray(testObject, "propA", { scan_keys: true });
            expect(paths.length).to.be(1);
            expect(paths[0]).to.be("o.propA");
        });
    });

    describe("query parameter", function() {
        it("should accept a regular string", function() {
            expect(function() {
                xray(testObject, "valA");
            }).to.not.throwException();
        });
        it("should accept a RegExp object", function() {
            expect(function() {
                xray(testObject, /valA/);
            }).to.not.throwException();
        });
        it("should accept a function", function() {
            expect(function() {
                xray(testObject, function(value) { return false; });
            }).to.not.throwException();
        });
        it("should throw an exception if anything else is passed as a query", function() {
            var errorRegExp = /Query parameter must be a string, RegExp object, or function/
            expect(function() { xray(testObject, window); }).to.throwException(errorRegExp);
            expect(function() { xray(testObject, []); }).to.throwException(errorRegExp);
            expect(function() { xray(testObject, 2); }).to.throwException(errorRegExp);
            expect(function() { xray(testObject, false); }).to.throwException(errorRegExp);
        });
    });

    describe("prototype properties", function() {
        it("should find properties part of the parent prototype", function() {

            var GrandParent = Class.extend({ grandParentProperty: "grandparent value" });
            var Parent = GrandParent.extend({ parentProperty: "parent value" });
            var Child = Parent.extend({ childProperty: "child value" });
            var child = new Child();

            var paths = xray(child, "value");
            expect(paths.length).to.be(3);
            expect(paths[0]).to.be("o.childProperty");
            expect(paths[1]).to.be("o.parentProperty");
            expect(paths[2]).to.be("o.grandParentProperty");

            paths = xray(child, /property/i, { scan_keys: true });
            expect(paths.length).to.be(3);
        });
    });
});
