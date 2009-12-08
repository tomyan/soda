
if (! this.soda) (function (main) {

   /**
    * Namespace: soda - Javascript Asynchronous Loader
    *
    * Implements a simple asyncronous loader and module pattern based on dynamic
    * script tags (or load function for command line Javascript). This intended
    * to be loaded before javascript libraries that use the module pattern, allowing
    * those libraries to interoperate.
    */
    var soda = main.soda = { verison: 0.3 },

        // default path to load modules from
        defaultLoadPath = null,

        // array of arrays, each containimg namespace regex, url prefix and a namespace character count
        inc = [],

        // script elements and timeouts keyed by module name, for removal
        scriptElements = soda.scriptElements = {},

        // pending modules
        pendingModules = [],

        // loaded Module objects keyed by name
        modules = {},

        // <head> tag to add script elements to
        head = main.document ? main.document.getElementsByTagName('head')[0] : false,

        // called when a module isn't loaded after the timeout
        ontimeout = soda.ontimeout = function (mod, url) {
            if (console && console.log)
                console.log("Soda: loading module " + mod + " timed out (url: '" + url + "')");
        },

        // number of seconds to allow for modules to load before debug
        timeout = soda.timeout = 20,

        isNode = (GLOBAL == main),

        pathPrefix = '',

        fromPath,

        // private class: Module - internal representation of a module
        Module = function (name, dependencies, code) {
            var script;
            this.name    = name;
            this.code    = code;
            this.ran     = false;
            this.dependencies =
                (typeof(dependencies) == 'array' || dependencies instanceof Array) ?
                    dependencies : [dependencies];

            if (this.name) {
                modules[this.name] = this;
                script = scriptElements[this.name];
                if (script) {
                    main.clearTimeout(script[1]);
                    head.removeChild(script[0]);
                    delete scriptElements[this.name];
                }
            }

            if (this.dependencies.length == 0) {
                this.run();
            }
            else {
                pendingModules.push(this);
                this.loadDependencies();
            }
        };

    function nodePathPrefix () {
        var sodadir = __filename.split(/[\\\/]/),
            cwd     = process.cwd().split(/[\\\/]/),
            root    = '',
            found   = false,
            i       = 0,
            l       = sodadir.length - 2;

        sodadir.pop();

        sodadir.shift();
        cwd.shift();

        for (; i < l; i++) {
            if (found) {
                root += '../';
            }
            else {
                if (cwd[i] != sodadir[i]) {
                    found = true;
                    i--;
                }
            }
        }

        return root;
    }

    if (isNode) {
        pathPrefix = nodePathPrefix();
        fromPath = process.cwd();
    }

    // private method: Module.run - execute the implementation function, called when dependencies have loaded.
    Module.prototype.run = function () {
        if (this.name) {
            this.ran = true;
            if (! (this.namespace = this.code.apply(main, this.dependencies))) {
                throw new Error('module "' + this.name + '" did not return a namespace object');
            }
            this.processPendingDependents();
        }
        else {
            this.code.apply(main, this.dependencies);
        }
    };

    Module.prototype.processPendingDependents = function () {
        var run = [], ready, i = 0, l = pendingModules.length, j, jl;
        for (; i < l; i++) {
            ready = true;
            j = 0;
            jl = pendingModules[i].dependencies.length;
            for (; j < jl; j++) {
                if (pendingModules[i].dependencies[j] == this.name) {
                    pendingModules[i].dependencies[j] = this.namespace;
                }
                else if (typeof(pendingModules[i].dependencies[j]) == 'string') {
                    ready = false;
                }
            }
            if (ready) {
                run.push(pendingModules[i]);
                pendingModules.splice(i--, 1);
                l--;
            }
        }
        for (i = 0, l = run.length; i < l; i++) {
            run[i].run();
        }
    };

    Module.prototype.loadNodeDependency = function (name) {
        if (! isNode) {
            throw new Error('can only load node modules when running in node.js');
        }
        // some shameless duck typing :-p
        var mod = modules['node:' + name] = {
            'name'         : 'node:' + name,
            'namespace'    : mod,
            'ran'          : false,
            'dependencies' : []
        };
        require.async(name).addCallback(function (ns) {
            mod.ran = true;
            mod.namespace = ns;
            Module.prototype.processPendingDependents.call(mod);
        });
    };

    function requireErrorCallback (name, path) {
        return function () {
            throw new Error('could not load module "' + name + '" from path "' + path + '"');
        };
    }

    Module.prototype.loadDependencies = function () {
        var url, i, l, j, jl, name, urlBase, script, chars;
        for (i = 0, l = this.dependencies.length; i < l; i++) {
            name = this.dependencies[i];
            if (typeof(name) != 'string' || modules[name] || scriptElements[name]) continue;
            if (name.substr(0, 5) == 'node:') {
                this.loadNodeDependency(name.substr(5));
                continue;
            }
			chars = 0;
            for (j = 0, jl = inc.length; j < jl; j++) {
                if (inc[j][0].test(name) && inc[j][2] > chars) {
                    urlBase = inc[j][1];
                    chars = inc[j][2];
                }
            }
            if (! urlBase) throw new Error("soda.load: no lib configured for '" + name + "'");
            url = urlBase + '/' + String(name).replace(/_/g, '/') + '.js';
            if (main.document && main.document.createElement && head) {
                script = document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.setAttribute('src', url);
                head.appendChild(script);
                scriptElements[name] = [
                    script,
                    ontimeout ?
                        main.setTimeout(
                            function () {
                                if (ontimeout) ontimeout(name, url);
                            },
                            timeout * 1000
                        ) : 0
                ];
            }
            else if (require && require.async) {
                url = url.replace(/\.js$/, '');
                require.async(pathPrefix + url)
                    .addErrback(requireErrorCallback(name, pathPrefix + url));
            }
            else if (main.load) { // spidermonkey or similar (TODO - require commonjs?)
                main.load(url);
            }
            else {
                throw new Error('Soda: cannot load, unsupported environment');
            }
        }
    };

    function dirPath (from, to) {
        var pre = '', post = '';
        while (from.indexOf(to) != 0) {
            post = to.match(/[\\\/](\w+)$/)[1] + '/' + post;
            to = to.replace(/[\\\/]\w+$/, '');
        }
        return (pre + post).replace(/\/$/, '');
    }

   /**
    * Function: soda.lib
    *
    *   Tell Soda where to load modules within a particular namespace from.
    *
    *   Arguments:
    *     urlPrefix           - (string) prefix of the URL to load modules from.
    *     namespacePrefix(es) - (list of strings) prefix(es) of namespaces to load.
    *
    *   Example:
    *     soda.lib('http://mylib.com/1.0', 'myLib', 'myOtherLib');
    *     soda.load('myLib'); // loads http://mylib.com/1.0/myLib.js
    *     soda.load('myLib.aNamespace'); // loads http://mylib.com/1.0/myLib/aNamespace.js
    *     soda.load('myOtherLib.anotherNamespace'); // loads http://mylib.com/1.0/myOtherLib/anotherNamespace.js
    *     soda.load('myLib2'); // throws unknown module error
    */
    soda.lib = function (urlPrefix) {
        var l = arguments.length - 1, nsPrefix, i, dirs;

        // TODO handle absolute paths on windows
        if (isNode && urlPrefix.indexOf('/') == 0) {
            urlPrefix = dirPath(fromPath, urlPrefix);
        }

        if (l == -1) {
            throw new Error('soda.lib: no urlPrefix passed');
        }
        else if (l == 0) {
            if (defaultLoadPath) {
                throw new Error('soda.lib: default lib path already set');
            }
            defaultLoadPath = urlPrefix;
        }
        else {
            for (i = 1; i <= l; i++) {
                nsPrefix = arguments[i];
                inc[inc.length] = [
                    new RegExp('^' + nsPrefix + '(?:_|$)'),
                    urlPrefix,
                    nsPrefix.length
                ];
            }
        }
    };

   /**
    * Function: soda.module
    *
    *   Create a new module with the Soda module pattern.
    *
    *   Arguments:
    *     opts - (object) options object containing:
    *       name    - (string, required) the module name (must correspond to the filename).
    *       depends - (array of strings, optional) the modules that this module depends on.
    *       code    - (function, required) called when the dependencies are loaded. This is
    *                 where the module implementation is put.
    */ 
    soda.module = function (opts) {
        new Module(opts.name, opts.depends || [], opts.code);
    };

   /** 
    * Function: soda.load
    *
    *   Load a module/modules and run a function when done.
    *
    *   Arguments:
    *     modulesToLoad   - (string/array of strings) module(s) to load.
    *     callback - (function, optional) callback to run when the module(/modules) is loaded.
    */
    soda.load = function (dependencies, onload) {
        new Module(null, dependencies, onload);
    };

})(GLOBAL || this);
