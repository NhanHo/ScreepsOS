import { ProcessPriority } from "../components/processes/constants";

export interface Process {
    pid: number;
    parentPID: number;
    status: number;
    run: any;
    classPath: string;
    setMemory(memory: any): void;
    priority: ProcessPriority;
}
