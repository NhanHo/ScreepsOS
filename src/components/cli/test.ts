import { processTable } from "../kernel/kernel";
export = function (___: any) {
    for (let pid in processTable) {
        const process = processTable[pid];
        console.log(pid + ":" + process.constructor.name);
    }
}
