import Process = require("../process");
interface OutpostMemory {
    colonyPid: number;
    miningPid: number[];
    roomName: string;
}
class OutpostProcess extends Process {
    public memory: OutpostMemory;
    public run(): number {
        return 0;
    }
}

export = OutpostProcess;
