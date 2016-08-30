import { killProcess, storeProcessTable, processTable } from "../kernel/kernel";
export = function (argv: string[]) {
    let parentPid = parseInt(argv[0], 10);
    for (let pid in processTable) {
	let p = processTable[pid];
	if (p.parentPID === parentPid) {
	    killProcess(parseInt(pid));
	}
    }
    storeProcessTable();
    
};
