# xray.js

Recursively scan JavaScript objects' properties. Useful for testing to see whether an object contains something of interest. If you're using Google Chrome, consider loading this via [JSKit](https://chrome.google.com/webstore/detail/jskit/aopfdhabfojdkgcmibiegfhpfkcokmdg).

[![Travis Build Status](https://api.travis-ci.org/janeklb/xray.js.png?branch=master)](https://travis-ci.org/janeklb/xray.js)

### Usage:

`xray(object, scanner)` returns an array of JSONPaths to (nested) object values that are matched by the scanner

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
paths = xray(someObj, function(value, properties) {
    // properties has:
    //  isKey: boolean
    //  path: path to current value
    return value === "find me";
}, {
    // ...
});

```

### Todo:

- handle DOM Node scanning better

### Changes:

0.5
- node module now directly exports a function (ie. `var xray = require('xray')` vs. `var xray = require('xray').xray`)
- JSONPath output
- added `properties` argument to custom scanner callback
