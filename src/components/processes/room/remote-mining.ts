import Process = require("../process");
interface RemoteMiningMemory {
    sourceId: string;
    //Instead of using a map with x, y and roomName, we use a tuple of size 3, implemented as array in TS to store position: [x, y, roomName]
    flagName: string;
}

class RemoteMiningProcess extends Process {
    public classPath = "components.processes.room.remote-mining";
    public memory: RemoteMiningMemory;
    public receiveCreep(creepID: string, creep: Creep) {
        creepID; creep;
    }
    public run(): number {
        let memory = this.memory;
        memory;
        console.log("Running mining for source:" + this.memory.sourceId);
        return 0;
    }
}

export = RemoteMiningProcess;
