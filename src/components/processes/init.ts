import Process = require("./process");

class InitProcess extends Process {
    public classPath = "components.processes.init";
    public run(): number {
        return 0;
    }
}

export = InitProcess;
