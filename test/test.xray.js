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
        it("should accept a regular string");
        it("should accept a RegExp object");
        it("should accept a function");
    });

    describe("prototype properties", function() {
        it("should find properties part of the parent prototype");
    });
});