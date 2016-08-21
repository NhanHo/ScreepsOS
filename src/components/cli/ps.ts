import { processTable } from "../kernel/kernel";
export = function () {
    for (let pid in processTable) {
        let process = processTable[pid];
        if (process.parentPID === 0) {
            console.log(process.pid + ": " + process.constructor.name);
        }
    }
}
