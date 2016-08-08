import { addProcess, storeProcessTable } from "../kernel/kernel";
import Process = require("./process");
class HelloWorldProcess extends Process {
    status: number;
    className: string;
    readonly classPath: string = "components.process.hello-world";
    public pid: number;
    public parentPID: number;

    public run(): number {
        let memory = this.memory;
        memory.counter = memory.counter || 0;
        console.log(memory.counter);
        memory.counter += 1;
        return 0;
    }

    public static startNewCounter() {
        let p = new HelloWorldProcess(0, 0);
        addProcess(p);
        storeProcessTable();
    }

    //public reloadFromMemory(memory: any) { memory; };
}

export = HelloWorldProcess;

