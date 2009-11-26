
soda.module({
    name : 'soda.debug',
    onload : function () {
       /**
        * function soda.debug.status
        *
        *   Get the loaded and pending modules as a text report.
        */
        soda.debug = {};
        soda.debug.status = function () {
            var res = '== ran\n', mod;
            for (mod in soda.modules) {
                if (mod.ran) continue;
                res += '- ' + mod + '\n';
            }
            res += '\n== waiting for dependencies\n';
            for (mod in soda.modules) {
                if (! mod.ran) continue;
                res += '- ' + mod + '\n';
            }
            res += '\n== not loaded\n';
            for (mod in soda.scriptElements) {
                res += '- ' + mod + ' from ' + soda.scriptElements[mod][0].src + '\n';
            }
            res += '\n== module hooks\n';
            for (var ident in soda.onLoadModules) {
                res += soda.onLoadModules[ident][0].join(',') + ' - ' + soda.onLoadModules[ident][1] + '\n';
            }
            return res;
        };
    }
});

