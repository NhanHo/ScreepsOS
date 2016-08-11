declare var require: any;
export = function(s: string) {
    let arr = s.trim().split(" ");
    let procName = arr[0];
    let argv = arr.splice(1);
    let proc = require("components.cli." + procName);
    if (proc)
	proc(argv);
}
