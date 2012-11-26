# xray.js

Recursively scan JavaScript objects and their properties. Useful for testing to see whether an object contains something of interest. If you're using Google Chrome, consider loading this via [JSKit](https://chrome.google.com/webstore/detail/jskit/aopfdhabfojdkgcmibiegfhpfkcokmdg).

### Usage:

`xray(Object object, String regex)` returns an array of property paths to (nested) object values that match the regex

```javascript
someObj = {
    propA: 1,
    propB: "find me",
    propC: {
        propA: "find me",
        propB: [
            "can you", "find me", "too"
        ],
        propC: {
            tooDeep: {
                propA: "hello... can you find me"
            }
        },
        "propD-find me": "OK"
    }
};

// Scan the object with a string:
paths = xray(someObj, "find me", {
    scan_keys:        true, // will also attempt to match the key names
    max_depth:        2     // recursion depth
});

// paths === ["o.propB", "o.propC.propA", "o.propC['propD-find me']"]

// Or, with a RegExp object:
paths = xray(someObj, /find ME/i, {
    // ...
})

// Or, with a custom function that indicates a match by returning a truthy value:
paths = xray(someObj, function(value) {
    return value === "find me";
}, {
    // ...
});

```

### Todo:

- test on non-browser JS runtimes
