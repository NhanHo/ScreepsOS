import { ProcessStatus } from "../processes/process-status";

import { ProcessPriority } from "../processes/constants";
import { Process } from "../../typings/process.d.ts";
let ticlyQueue: Process[] = [];
let ticlyLastQueue: Process[] = [];
let lowPriorityQueue: Process[] = [];
export let processTable: { [pid: string]: Process } = {};

export let reboot = function () {
    ticlyQueue = [];
    ticlyLastQueue = [];
    lowPriorityQueue = [];
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


export let garbageCollection = function () {
    Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: string) => (processTable[k]));
}
export let addProcess = function <T extends Process>(p: T, priority = ProcessPriority.LowPriority) {
    let pid = getFreePid();
    p.pid = pid;
    p.priority = priority;
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

export let getProcessById = function (pid: number): Process {
    return processTable[pid];
};


export let storeProcessTable = function () {
    let aliveProcess = _.filter(_.values(processTable), (p: Process) => p.status != ProcessStatus.DEAD);

    Memory["processTable"] = _.map(aliveProcess, (p: Process) => [p.pid, p.parentPID, p.classPath, p.priority]);
};

export let getProcessMemory = function (pid: number) {
    Memory.processMemory = Memory.processMemory || {};
    Memory.processMemory[pid] = Memory.processMemory[pid] || {};
    return Memory.processMemory[pid];
};


let runOneQueue = function (queue: Process[]) {
    while (queue.length > 0) {
        let process = queue.pop();
        while (process) {
            try {
                if (process.status !== ProcessStatus.DEAD)
                    process.run();
            } catch (e) {
                console.log("Fail to run process:" + process.pid);
                console.log(e.message);
                console.log(e.stack);
            }
            process = queue.pop();
        }
    }

}
export let run = function () {
    runOneQueue(ticlyQueue);
    runOneQueue(ticlyLastQueue);
    runOneQueue(lowPriorityQueue);
};

declare var require: any;

export let loadProcessTable = function () {
    reboot();
    Memory["processTable"] = Memory["processTable"] || [];
    let storedTable = Memory["processTable"];
    for (let item of storedTable) {
        let [pid, parentPID, classPath, ...remaining] = item;
        try {
            let processClass = require(classPath);
            let memory = getProcessMemory(pid);
            let priority = ProcessPriority.Ticly;
            if (remaining.length)
                priority = remaining[0];
            let p = new processClass(pid, parentPID, priority);
            p.setMemory(memory);
            //p.reloadFromMemory(getProcessMemory(p));
            processTable[p.pid] = p;
            if (priority === ProcessPriority.Ticly)
                ticlyQueue.push(p);
            if (priority === ProcessPriority.TiclyLast)
                ticlyLastQueue.push(p);
            if (priority === ProcessPriority.LowPriority)
                lowPriorityQueue.push(p);
        } catch (e) {
            console.log("Error when loading:" + e.message);
            console.log(classPath);
        }
    }
};
