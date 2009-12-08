Soda JavaScript Loader
======================

Version 0.3

Description
-----------

Implements a simple asyncronous loader and module pattern based on dynamic
script tags.

Usage
-----

In your html file:

    <script type="text/javascript" src="soda_compressed.js"></script>
    
    <script type="text/javascript">
        
        // tell Soda where to find modules that start mylib
        soda.lib('../mylib/src', 'mylib');
        
        // tell Soda where to find all other modules
        soda.lib('http://my.js.repo/js');
        
        // load mylib and mylib_blah
        soda.load(
            ['mylib', 'mylib_blah'],
            function (mylib, mylib_blah) {
                // ../mylib/src/mylib.js and ../mylib/src/mylib/blah.js are loaded here
            }
        );
        
        // don't assume they are loaded here - the loader is async
        
    </script>

In your module (Soda module pattern):

    soda.module({
        name    : 'mylib',        // this must match the name used to load it
        depends : ['myotherlib'], // dependencies are automatically loaded
        code    : function (myotherlib) {
            // dependencies are available here via parameters
        }
    });

### Using with Node.js

Soda works with Node.js. Use Node's `require` method to load soda (use the uncompressed
version) as you would any Node module. You can then load and depend on modules as you
would on the client-side. Additionally, depending on modules with the prefix `node:`
allows you to load node's built in modules and those located in Node's `require.paths` array:

    soda.load('node:sys', function (sys) {
        sys.puts('hello');
    });

This allows Soda to be the only module you need to load synchronously and `soda` to be the only
global variable that isn't sandboxed by Soda's module system.

This mechanism is likely to be extended in the future to allow alternative modules for different
environments (e.g. 'node:http|browser:http_over_comet').

API
---

### Function: soda.lib

Tell Soda where to load modules within a particular namespace from.

Arguments:
  urlPrefix       - (string) prefix of the URL to load modules from.
  namespacePrefix - (string/strings) optional prefix(es) of namespaces to load.

### Function: soda.load

Load a module/modules and run a function when done.

Arguments:
  module - (string/array of strings) module(s) to load.
  onload - (function, optional) callback to run when the module(/modules) is loaded.

### Function: soda.module

Create a new module with the Soda module pattern.

Arguments:
  opts - (object) options object containing:
    name    - (string, required) the module name (must correspond to the filename).
    depends - (array of strings, optional) the modules that this module depends on.
    code    - (function, required) called when the dependencies are loaded, with the
              namespace of each dependency passed as a paramter. The function should
              return a namespace object containing the public interface of the module.

Building
--------

To build a compressed version of Soda from a checked out copy, run `make` in the root
directory. The file `src/soda_compressed.js` is created.

Installation
------------

Download [soda_compressed.js](http://cloud.github.com/downloads/tomyan/soda/soda_compressed.js)
and save to a convenient location.

Contact
-------

You can join the Soda Mailing List by sending an email to
[sodajs@librelist.com](mailto:sodajs@librelist.com). You can also try the #sodajs
channel on Freenode IRC, or follow the
[http://twitter.com/sodajs](sodajs user on Twitter) for commit information.

License
-------

The MIT License

Copyright (c) 2009 Thomas Yandell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
