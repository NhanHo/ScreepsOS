import { killProcess } from "../kernel/kernel";
import { ProcessPriority } from "./constants";

abstract class Process {
    public status: number;
    abstract run(): number;
    public classPath: string;
    public priority: ProcessPriority;
    memory: any;
    constructor(public pid: number, public parentPID: number, priority = ProcessPriority.LowPriority) {
        this.status = 1;
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
