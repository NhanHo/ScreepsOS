import { ProcessStatus } from "../processes/process-status";
export let processQueue: Process[] = [];
export let processTable: { [pid: string]: Process } = {};

export let reboot = function () {
    processQueue = [];
    processTable = {};
};

let getFreePid = function () {
    let currentPids = _.sortBy(_.map(processTable, p => p.pid));
    let counter = -1;
    for (let pid of currentPids) {
        counter += 1;
        if (pid !== counter)
            return counter;
    }
    return currentPids.length;
};

export let addProcess = function <T extends Process>(p: T) {
    let pid = getFreePid();
    p.pid = pid;
    processTable[p.pid] = p;
    Memory.processMemory[pid] = {};
    p.setMemory(getProcessMemory(pid));
    return p;
};

export let killProcess = function (pid: number) {
    processTable[pid].status = ProcessStatus.DEAD;
    Memory.processMemory[pid] = undefined;
    //Right now, we will also kill any child process when a process is killed.
    //TODO : implement it here

    return pid;
};

export let getProcessById = function <T extends Process>(pid: number): T {
    return <T>processTable[pid];
};


export let storeProcessTable = function () {
    let aliveProcess = _.filter(_.values(processTable), (p: Process) => p.status != ProcessStatus.DEAD);
    Memory["processTable"] = _.map(aliveProcess, (p: Process) => [p.pid, p.parentPID, p.classPath]);
};

export let getProcessMemory = function (pid: number) {
    Memory.processMemory = Memory.processMemory || {};
    Memory.processMemory[pid] = Memory.processMemory[pid] || {};
    return Memory.processMemory[pid];
};

export let run = function () {
    while (processQueue.length > 0) {
        let process = processQueue.pop();
        while (process) {
            try {
                if (process.status !== ProcessStatus.DEAD)
                    process.run();
            } catch (e) {
                console.log("Fail to run process:" + process.pid);
                console.log(e.message);
            }
            process = processQueue.pop();
        }
    }
};

declare var require: any;

export let loadProcessTable = function () {
    reboot();
    Memory["processTable"] = Memory["processTable"] || [];
    let storedTable = Memory["processTable"];
    for (let item of storedTable) {
        let [pid, parentPID, classPath] = item;
        try {
            let processClass = require(classPath);
            let memory = getProcessMemory(pid);
            let p = new processClass(pid, parentPID);
            p.setMemory(memory);
            //p.reloadFromMemory(getProcessMemory(p));
            processTable[p.pid] = p;
            processQueue.push(p);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(classPath);
        }
    }
};
