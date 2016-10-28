import { addProcess, storeProcessTable, processTable } from "../kernel/kernel/kernel";
import Process = require("../kernel/kernel/process");
import InitProcess = require("../processes/init");
export = function (___: any) {
    let p = new InitProcess(0, 0);
    let pidZero = processTable[0];
    if (!pidZero) {
        addProcess(p);
        p.pid = 0;
        storeProcessTable();
    } else {
        addProcess(pidZero);
        let newPid = pidZero.pid;
        let processList: Process[] = _.values(processTable) as Process[];
        for (let process of processList) {
            if (process.parentPID === 0) {
                process.parentPID = newPid;
            }
        }
        pidZero.parentPID = 0;
        Memory.processMemory[newPid] = _.cloneDeep(Memory.processMemory[0]);
        delete (processTable[0]);
        addProcess(p);
        p.pid = 0;
        storeProcessTable();
    }
};
