/*jshint browser:true */
/*global console:true */
(function() {

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

    function XRayScanner(query) {

        var type = typeof query;
        switch (type) {
            case "function":
                this.check = query;
                break;
            case "string":
                query = new RegExp(query);
            case "object":
                if (query.exec && query.compile && query.test) {
                    this.check = function(value) {
                        return query.test(value + "");
                    };
                    break;
                }
            default:
                throw new Error("Query parameter must be a string, RegExp object, or function");

        }
    }

    function XRayMachine(object, query, options) {

        options         = options || {};

        this.scanner    = new XRayScanner(query);
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
        var result = "$", i = 0, p;
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

    XRayMachine.prototype.check = function(value, isKey) {
        // test a string coerced value against the regular expresssion
        // and track the path if it matches
        var path = this.currentPath();
        var params = {
            path: this.readablePath(path),
            isKey: !!isKey
        };
        if (this.scanner.check(value, params)) {
            this.matched.push(path);
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
                    this.check(k, true);
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


    if (typeof window != 'undefined') {
        window.xray = xray;
    } else if (typeof module != 'undefined') {
        module.exports = xray;
    } else {
        throw new Error("Unable to export xray");
    }

})();
