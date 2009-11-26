
if (! this.soda) (function (main) {

   /**
    * Namespace: soda - Javascript Asynchronous Loader
    *
    * Implements a simple asyncronous loader and module pattern based on dynamic
    * script tags (or load function for command line Javascript). This intended
    * to be loaded before javascript libraries that use the module pattern, allowing
    * those libraries to interoperate.
    */
    var soda = main.soda = {},

        // array of arrays, each containimg namespace regex, url prefix and a namespace character count
        inc = [],

        // script elements and timeouts keyed by module name, for removal
        scriptElements = soda.scriptElements = {},

        // loaded Module objects keyed by name
        modules = soda.modules = {},

        // used to create id's for module load hooks
        hookIdCounter = 0,

        // hooks to be run when modules are loaded
        // keyed on unique id, each value is array containing array of mods and callback
        onLoadModules = soda.onLoadModules = {},

        // <head> tag to add script elements to
        head = main.document ? main.document.getElementsByTagName('head')[0] : false,

        // called when a module isn't loaded after the timeout
        ontimeout = soda.ontimeout = function (mod, url) {
            if (console && console.log)
                console.log("Soda: loading module " + mod + " timed out (url: '" + url + "')");
        },

        // number of seconds to allow for modules to load before debug
        timeout = soda.timeout = 20,

        // regex to match module names and namespace prefixes
        nsRegex = /^\w+(?:\.\w+)*$/,

        // private class: Module - internal representation of a module
        Module = function (opts) {
            this.name = opts.name;
            this.depends = opts.depends;
            this.onload = opts.onload;
            this.ran = false;
            var script = scriptElements[this.name];
            if (script) {
                main.clearTimeout(script[1]);
                head.removeChild(script[0]);
                delete scriptElements[this.name];
            }
        };

    soda.version = 1.2;

    // private method: Module.run - execute the implementation function, called when dependencies have loaded.
    Module.prototype.run = function () {
        this.ran = true;
        this.onload.call(main);
        callHooks();
    };

    // private function: callHooks - check if there are any callbacks ready to run and run them
    function callHooks () {
        var i, l, mods, name, hookId, ready, hook;
        for (hookId in onLoadModules) {
            ready = true;
            mods = onLoadModules[hookId][0];
            for (i = 0, l = mods.length; i < l; i++) {
                if (! (name = mods[i])) continue;
                if (modules[name] && modules[name].ran) {
                    mods.splice(i--, 1);
				}
                else ready = false;
            }
            if (ready) {
                hook = onLoadModules[hookId][1];
                delete onLoadModules[hookId];
                main.setTimeout ?
                    main.setTimeout(hook, 0) :
                    hook.call(main);
            }
        }
    }

   /**
    * Function: soda.lib
    *
    *   Tell Soda where to load modules within a particular namespace from.
    *
    *   Arguments:
    *     namespacePrefix - (string/array of strings) prefix(es) of namespaces to load.
    *     urlPrefix       - (string) prefix of the URL to load modules from.
    *
    *   Example:
    *     soda.lib(['myLib', 'myOtherLib'], 'http://mylib.com/1.0');
    *     soda.load('myLib'); // loads http://mylib.com/1.0/myLib.js
    *     soda.load('myLib.aNamespace'); // loads http://mylib.com/1.0/myLib/aNamespace.js
    *     soda.load('myOtherLib.anotherNamespace'); // loads http://mylib.com/1.0/myOtherLib/anotherNamespace.js
    *     soda.load('myLib2'); // throws unknown module error
    */
    soda.lib = function (nsPrefix, urlPrefix) {
        if (typeof(nsPrefix) == 'array' || nsPrefix instanceof Array) {
            for (var i = 0, l = nsPrefix.length; i < l; i++)
                soda.lib(nsPrefix[i], urlPrefix);
        }
        else {
            if (! nsRegex.test(nsPrefix))
                throw "soda.lib: invalid namespace prefix '" + nsPrefix + "'";
            inc[inc.length] = [
                new RegExp('^' + nsPrefix.replace('.', '\\.') + '(?:\\.|$)'),
                urlPrefix,
				nsPrefix.length
            ];
        }
    };

   /** 
    * Function: soda.load
    *
    *   Load a module/modules and run a function when done.
    *
    *   Arguments:
    *     module   - (string/array of strings) module(s) to load.
    *     callback - (function, optional) callback to run when the module(/modules) is loaded.
    */
    soda.load = function (module, callback) {
        if (typeof(module) == 'array' || module instanceof Array) module = module.slice();
        else module = [module];
        var url, i, l, j, jl, mods = {}, name, urlBase, script, chars;
        for (i = 0, l = module.length; i < l; i++) {
            name = module[i];
            if (modules[name] || scriptElements[name]) continue;
			chars = 0;
            for (j = 0, jl = inc.length; j < jl; j++) {
                if (inc[j][0].test(name) && inc[j][2] > chars) {
                    urlBase = inc[j][1];
                    chars = inc[j][2];
                }
            }
            if (! urlBase) throw "soda.load: no lib configured for '" + name + "'";
            url = urlBase + '/' + String(name).replace(/\./g, '/') + '.js';
            if (main.document && main.document.createElement && head) {
                script = document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.setAttribute('src', url);
                head.appendChild(script);
                scriptElements[name] = [
                    script,
                    soda.ontimeout ?
                        main.setTimeout(
                            function () {
                                if (soda.ontimeout) soda.ontimeout(name, url);
                            },
                            soda.timeout * 1000
                        ) : 0
                ];
            }
            else if (main.load) {
                main.load(url);
            }
            else {
                throw 'Soda: cannot load, unsupported environment';
            }

        }
        if (callback) {
            onLoadModules[hookIdCounter++] = [module, callback];
            callHooks();
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
    *       onload  - (function, required) called when the dependencies are loaded. This is
    *                 where the module implementation is put.
    */ 
    soda.module = function (opts) {
        var mod = new Module(opts);
        modules[mod.name] = mod;
        if (mod.depends && mod.depends.length) {
            soda.load(mod.depends, function () { mod.run(); });
        }
        else {
            mod.run();
        }
    };

})(this);
