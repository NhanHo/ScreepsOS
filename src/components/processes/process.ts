import { killProcess } from "../kernel/kernel";
abstract class Process {
    public status: number;
    abstract run(): number;
    public classPath: string;
    memory: any;
    constructor(public pid: number, public parentPID: number) {
        this.status = 1;
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
