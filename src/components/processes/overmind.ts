import Process = require("./process");
import { getSpawnProcess } from "../kernel/kernel-utils";
import { addProcess } from "../kernel/kernel";
import { OvermindMemory } from "./memory/overmind";
abstract class OvermindProcess extends Process {
    public memory: OvermindMemory;
    abstract receiveCreep(id: string, creep: Creep);

    protected static addProcess = addProcess;
    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        //TODO: Check and throw error when there is no roomName
        let spawnProcess = getSpawnProcess(this.memory.spawningRoomName);
        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }

    abstract creepDies(id: string, pid: number);
}

export = OvermindProcess;
