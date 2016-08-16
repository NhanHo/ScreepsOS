import Process = require("./process");
import { getSpawnProcess } from "../kernel/kernel-utils";
import { OvermindMemory } from "./memory/overmind";
abstract class OvermindProcess extends Process {
    public memory: OvermindMemory;
    abstract receiveCreep(id: string, creep: Creep);

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        //TODO: Check and throw error when there is no roomName
        let spawnProcess = getSpawnProcess(this.memory.spawningRoomName);

        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }


}

export = OvermindProcess;
