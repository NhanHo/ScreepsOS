import { killProcess } from "../kernel/kernel";
import { ProcessPriority } from "./constants";
import { ProcessStatus } from "./process-status";
import { ProcessSleep } from "../../typings/process-sleep";
abstract class Process {
    public status: number;
    public classPath: string;
    public sleepInfo?: ProcessSleep;
    public priority: ProcessPriority;
    public memory: any;

    constructor(public pid: number,
        public parentPID: number,
        priority = ProcessPriority.LowPriority) {

        this.status = ProcessStatus.ALIVE;
        this.priority = priority;
    };

    public abstract run(): number;
    public setMemory(memory: any): void {
        this.memory = memory;
    };

    public stop(signal: number) {
        killProcess(this.pid);
        return signal;
    }
}

export = Process;
