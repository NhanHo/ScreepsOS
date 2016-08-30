import { processTable } from "../kernel/kernel";
//import Process = require("../processes/process");
export = function () {
    for (let pid in processTable) {
        let process: any = processTable[pid];
        if (process.parentPID === 0) {
            if (process.psInfo)
                console.log(process.pid + ": " + process.psInfo());
            else
                console.log(process.pid + ": " + process.constructor.name);
        }
    }
}
