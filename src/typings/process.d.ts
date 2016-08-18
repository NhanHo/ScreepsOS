import { ProcessPriority } from "../components/processes/constants";
import { ProcessSleep } from "./process-sleep.d.ts";
export interface Process {
    pid: number;
    parentPID: number;
    status: number;
    run: any;
    classPath: string;
    setMemory(memory: any): void;
    priority: ProcessPriority;
    sleepInfo?: ProcessSleep;
}
