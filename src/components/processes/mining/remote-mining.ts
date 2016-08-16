import OvermindProcess = require("../overmind");
import { OvermindMemory } from "../memory/overmind";
interface RemoteMiningMemory extends OvermindMemory {
    sourceId: string;
    //Instead of using a map with x, y and roomName, we use a tuple of size 3, implemented as array in TS to store position: [x, y, roomName]
    flagName: string;
}

class RemoteMiningProcess extends OvermindProcess {
    public classPath = "components.processes.mining.remote-mining";
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
