import { addProcess, storeProcessTable, processTable } from "../kernel/kernel";
import Process = require("../processes/process");
import InitProcess = require("../processes/init");
export = function(___: any) {
    let p = new InitProcess(0, 0);
    let pidZero = processTable[0];
    if (!pidZero) {
	addProcess(p);
	storeProcessTable();
    } else {
	addProcess(pidZero);
	let newPid = pidZero.pid;
	let processList: Process[] =<Process[]> _.values(processTable);
	for (let process of processList) {
	    if (process.parentPID === 0)
		process.parentPID = newPid;
	}
	delete(processTable[0]);
	addProcess(p);
	storeProcessTable();
	
    }
    
}
