/*jshint browser:true */
/*global console:true */
(function(exports) {

    function XRayMachine(object, value, options) {

        if (!(this instanceof XRayMachine)) {
            return new XRayMachine();
        }

        options         = options || {};

        var regex_modifiers = '';
        if (options.case_insensitive) regex_modifiers += 'i';
        if (options.multi_line)       regex_modifiers += 'm';

        this.reg_exp    = new RegExp(value, regex_modifiers);
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
                result.push(this.result(this.matched[i]));
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

    XRayMachine.prototype.result = function(path) {
        var result = '', i = 0;
        for (; i < path.length; i++) {
            result += '["' + path[i] + '"]';
        }
        return result;
    };

    XRayMachine.prototype.isNode = function(o) {
        return (typeof Node === "object" ?
                o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    };

    XRayMachine.prototype.check = function(value) {
        // test a string-casted value against the regular expresssion
        // and track the path if it matches
        if (this.reg_exp.test(value + '')) {
            this.matched.push(this.path.slice(0));
        }
    };

    XRayMachine.prototype._scan = function(object, depth) {

        if (this.max_depth > 0 && depth > this.max_depth) {
            return;
        }

        // only scan once!
        if (this.seen.indexOf(object) != -1) {
            return;
        }

        this.seen.push(object);

        switch (typeof object) {
        case 'object':

            // don't scan DOM nodes
            if (this.isNode(object)) {
                return;
            }

            for (var k in object) {
                if (object.hasOwnProperty(k)) {

                    this.path.push(k);

                    if (this.scan_keys) {
                        this.check(k);
                    }

                    try {
                        this._scan(object[k], depth + 1);
                    } catch (err) {
                        console.log("unable to access", k, "in", object, "(" + err + ")");
                    }

                    this.path.pop();
                }
            }

            break;

        case 'function':
        case 'undefined':
            break;
        default:
            // for everything else, check directly
            this.check(object);
        }
    };

    exports.xray = function(object, value, options) {
        return new XRayMachine(object, value, options).scan();
    };

})(window);
