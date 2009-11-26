
soda.module({
    name : 'test1',
    depends : ['test1.mod1'],
    onload : function () {
        addResult('2 (1 of 2). test1 implementation');
    }
});

