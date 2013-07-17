/*jshint browser:true */
/*global console:true */
(function(exports) {

    "use strict";

    var numeric      = /^[0-9]+$/;
    var alphanumeric = /^[0-9a-z_\-]+$/i;

    function log() {
        if (console && typeof console.log === "function") {
            console.log.apply(console, arguments);
        }
    }

    function isNode(o) {
        return (typeof Node === "object" ?
                o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    }

    function adaptToRegExp(query) {
        if (typeof query === "object" &&
                query.exec && query.compile && query.test) {
            return query;
        } else if (typeof query === "string") {
            return new RegExp(query);
        } else if (typeof query === "function") {
            // mock a regex object with the user-submitted
            // scanning function
            return { test: query };
        }

        throw "Query parameter must be a string, RegExp object, or function";
    }

    function XRayMachine(object, query, options) {

        options         = options || {};

        this.reg_exp    = adaptToRegExp(query);
        this.scan_keys  = options.scan_keys;
        this.max_depth  = options.max_depth;
        this.object     = object;
    }

    XRayMachine.prototype.scan = function() {
        this.seen       = []; // seen objects
        this.matched    = []; // matched objects
        this.path       = []; // current depth

        this._scan(this.object, 0);

        // collect results into a pretty array
        var result      = [], i = 0;
        for (; i < this.matched.length; i++) {
            if (this.matched[i].length > 0) {
                result.push(this.readablePath(this.matched[i]));
            }
        }

        // clean memory after return
        clearTimeout(this.timeout);
        var that        = this;
        this.timeout    = setTimeout(function() {
            that.seen = that.depth = that.matched = [];
        }, 0);

        return result;
    };

    XRayMachine.prototype.readablePath = function(path) {
        var result = "o", i = 0, p;
        for (; i < path.length; i++) {
            p = path[i];
            if (numeric.test(p)) {
                result += "[" + p + "]";
            } else if (alphanumeric.test(p)) {
                result += "." + p;
            } else {
                result += "['" + p + "']";
            }
        }
        return result;
    };

    XRayMachine.prototype.currentPath = function() {
        return this.path.slice(0);
    };

    XRayMachine.prototype.check = function(value) {
        // test a string coerced value against the regular expresssion
        // and track the path if it matches
        if (this.reg_exp.test(value + "")) {
            this.matched.push(this.currentPath());
        }
    };

    XRayMachine.prototype._scan = function(object, depth) {

        // respect max depth
        if (this.max_depth > 0 && depth > this.max_depth) {
            return;
        }

        switch (typeof object) {
        case "object":
        case "function":

            // only scan once!
            if (this.seen.indexOf(object) !== -1) {
                return;
            }

            this.seen.push(object);

            // don't scan DOM nodes
            if (isNode(object)) {
                return;
            }

            for (var k in object) {

                this.path.push(k);

                if (this.scan_keys) {
                    this.check(k);
                }

                try {
                    this._scan(object[k], depth + 1);
                } catch (err) {
                    log("unable to access", k, "in", object, "(" + err + ")");
                }

                this.path.pop();
            }

            break;

        case "undefined":
            break;
        default:
            // for everything else, check directly
            this.check(object);
        }
    };

    var xray = function(object, query, options) {
        var machine = new XRayMachine(object, query, options);
        return machine.scan();
    };



    exports.xray = xray;

})(typeof exports === 'undefined' ? (typeof window === 'undefined' ? {} : window) : exports);
