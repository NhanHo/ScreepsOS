import OvermindProcess = require("../overmind");
import { OvermindMemory } from "../memory/overmind";
import MaintainerCreep = require("./maintainer-creep");
interface MaintainerMemory extends OvermindMemory {
    roomName: string;
    childPidList: number[];
}
export = class MaintainerProcess extends OvermindProcess {
    public classPath = "components.processes.room.maintainer";
    public memory: MaintainerMemory;
    public creepDies(__: string, pid: number) {
        this.memory.childPidList = _.filter(this.memory.childPidList, p => (p !== pid));
    }

    public receiveCreep(id: string, creep: Creep) {
        if (id === "maintainer") {
            const p = new MaintainerCreep(0, 0);
            MaintainerProcess.addProcess(p);
            p.memory.creepName = creep.name;
            this.memory.childPidList.push(p.pid);
        }

    }

    public run(): number {
        this.memory.childPidList = this.memory.childPidList || [];
        if (this.memory.childPidList.length < 1) {
            const room = Game.rooms[this.memory.spawningRoomName];
            const energyCapacity = room.energyCapacityAvailable;
            const multiplier = Math.floor(energyCapacity / (100 + 50 + 50));
            this.spawnCreep("maintainer", { MOVE: multiplier, CARRY: multiplier, WORK: multiplier });
        }
        return 0;
    }

    public static start(roomName: string, parentPID: number) {
        let p = new MaintainerProcess(0, parentPID);
        MaintainerProcess.addProcess(p);
        p.memory.spawningRoomName = roomName;
        p.memory.roomName = roomName;
        p.memory.childPidList = [];
        return p.pid;
    }
}
