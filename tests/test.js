
load('../src/soda.js');

function addResult (res) {
    print(res);
}

print("Soda Test");
print("=========");
print("");
print("There should be 8 items below.")
print("");

soda.lib('test1', 'lib1');
    soda.load('test1', function () {
    addResult('3 (1 of 2). test1 loaded callback');
});
soda.lib(['test2', 'test3'], 'lib2and3');
soda.load(['test2', 'test3.mod1'], function () {
    addResult('3 (1 of 2). test2, test3.mod1 loaded callback');
});

print("");
print("A status report should be output here.");
print("");

soda.lib('soda', '../src');
soda.load('soda.debug', function () {
    print(soda.debug.status() + '\n');
});

