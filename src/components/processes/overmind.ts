import Process = require("../kernel/kernel/process");
import { getSpawnProcess } from "../utils/spawn";
import { addProcess } from "../kernel/kernel/kernel";
import { OvermindMemory } from "./memory/overmind";
abstract class OvermindProcess extends Process {
    protected static addProcess = addProcess;

    public memory: OvermindMemory;
    public abstract receiveCreep(id: string, creep: Creep);
    public abstract creepDies(id: string, pid: number);

    protected spawnCreep(creepID: string, bodyParts: bodyMap, priority?: number) {
        // TODO: Check and throw error when there is no roomName
        let spawnProcess = getSpawnProcess(this.memory.spawningRoomName);
        if (spawnProcess) {
            spawnProcess.spawn(creepID, bodyParts, this.pid, priority);
        }
    }
}

export = OvermindProcess;
