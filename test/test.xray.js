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

describe("xray", function() {

    it("should be a function", function() {
        expect(window.xray).to.be.a("function");
    });

    it("should respect max depth", function() {
        var paths = xray(testObject, "valA", { max_depth: 1});
        expect(paths.length).to.be(1);
        expect(paths[0]).to.be('o.propA');
    });
});