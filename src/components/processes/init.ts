import Process = require("../kernel/kernel/process");

class InitProcess extends Process {
    public classPath(): string {
        return "components.processes.init";
    }

    public run(): number {
        return 0;
    }
}

export = InitProcess;
