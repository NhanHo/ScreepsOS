/*import { reboot, processTable, processQueue } from "./kernel";
declare var require: any;

export let loadProcessTable = function () {
    reboot();
    let storedTable = Memory["processTable"];
    for (let item of storedTable) {
        let [pid, parentPID, classPath, className] = item;
        try {
            let processClass = require(classPath);
            let p = new processClass(pid, parentPID);
            //p.reloadFromMemory(getProcessMemory(p));
            processTable[p.pid] = p;
            processQueue.push(p);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(className);
        }
    }
};
*/
