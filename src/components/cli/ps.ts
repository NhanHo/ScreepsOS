import { processTable } from "../kernel/kernel";
//import Process = require("../processes/process");
export = function (argv: string[]) {
    let parentID;
    console.log(JSON.stringify(argv));
    if (!argv.length)
        parentID = 0;
    else
        parentID = parseInt(argv[0]);
    for (let pid in processTable) {
        let process: any = processTable[pid];
        if (process.parentPID === parentID) {
            if (process.psInfo)
                console.log(process.pid + ": " + process.psInfo());
            else
                console.log(process.pid + ": " + process.constructor.name);
        }
    }
}
