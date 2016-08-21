import { ProcessPriority } from "../components/processes/constants";
import { ProcessSleep } from "./process-sleep.d.ts";
export interface Process {
    pid: number;
    parentPID: number;
    status: number;
    classPath: string;
    priority: ProcessPriority;
    sleepInfo?: ProcessSleep;

    setMemory(memory: any): void;
    run(): number;

}
