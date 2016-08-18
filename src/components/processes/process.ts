import { killProcess } from "../kernel/kernel";
import { ProcessPriority } from "./constants";
import { ProcessStatus } from "./process-status";
import { ProcessSleep } from "../../typings/process-sleep.d.ts";
abstract class Process {
    public status: number;
    abstract run(): number;
    public classPath: string;
    public sleepInfo?: ProcessSleep;
    public priority: ProcessPriority;
    memory: any;
    constructor(public pid: number, public parentPID: number, priority = ProcessPriority.LowPriority) {
        this.status = ProcessStatus.ALIVE;
        this.priority = priority;
    };

    setMemory(memory: any): void {
        this.memory = memory;
    };

    public stop(signal: number) {
        /*        if (this.parentPID) {
                  let process = getProcessById(this.parentPID);
                  //if (process)
                  //process.signalParent(this.pid);
                  }*/
        killProcess(this.pid);
        return signal;
    }


}

export = Process;
