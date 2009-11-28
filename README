Soda JavaScript Loader
======================

Version 0.1

Description
-----------

Implements a simple asyncronous loader and module pattern based on dynamic
script tags.

Usage
-----

In you html file:

<script type="text/javascript" src="soda.comp.js"></script>

<script type="text/javascript">

    // tell Soda where to find modules that start mylib
    soda.lib('mylib', '../mylib/src');

    // load mylib and mylib.blah
    soda.load(['mylib', 'mylib.blah'], function () {
        // ../mylib/src/mylib.js and ../mylib/src/mylib/blah.js are loaded here
    });

    // don't assume they are loaded here - the loader is async

</script>

In your module (Soda module pattern):

soda.module({
    name : 'mylib',           // this must match the name used to load it
    depends : ['myotherlib'], // dependencies are automatically loaded
    onload : function () {
        // dependencies are available here
    }
});

API
---

### Function: soda.lib

Tell Soda where to load modules within a particular namespace from.

Arguments:
  namespacePrefix - (string/array of strings) prefix(es) of namespaces to load.
  urlPrefix       - (string) prefix of the URL to load modules from.

### Function: soda.load

Load a module/modules and run a function when done.

Arguments:
  module   - (string/array of strings) module(s) to load.
  callback - (function, optional) callback to run when the module(/modules) is loaded.

### Function: soda.module

Create a new module with the Soda module pattern.

Arguments:
  opts - (object) options object containing:
    name    - (string, required) the module name (must correspond to the filename).
    depends - (array of strings, optional) the modules that this module depends on.
    onload  - (function, required) called when the dependencies are loaded. This is
              where the module implementation is put.

Installation
------------

Copy the file soda.comp.js to a convenient location (can be inlined
if you want to avoid a HTTP request).

License
-------

The MIT License

Copyright (c) 2008 Thomas Yandell

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
