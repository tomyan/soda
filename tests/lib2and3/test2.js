
soda.module({
    name : 'test2',
    depends : ['test2.mod1', 'test2.mod2'],
    onload : function () {
	addResult('2 (1 of 2). test2 implementation');
    }
});


