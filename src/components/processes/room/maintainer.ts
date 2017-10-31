import * as Kernel from "../../kernel/kernel/kernel";
import { OvermindMemory } from "../memory/overmind";
import OvermindProcess = require("../overmind");
import MaintainerCreep = require("./maintainer-creep");
interface MaintainerMemory extends OvermindMemory {
    roomName: string;
    childPidList: number[];
}
export = class MaintainerProcess extends OvermindProcess {
    public static start(roomName: string, parentPID: number) {
        const p = new MaintainerProcess(0, parentPID);
        MaintainerProcess.addProcess(p);
        p.memory.spawningRoomName = roomName;
        p.memory.roomName = roomName;
        p.memory.childPidList = [];
        return p.pid;
    }

    public classPath() {
        return "components.processes.room.maintainer";
    }
    public memory: MaintainerMemory;
    public creepDies(__: string, pid: number) {
        this.memory.childPidList = _.filter(this.memory.childPidList, (p) => (p !== pid));
    }

    public receiveCreep(id: string, creep: Creep) {
        if (id === "maintainer") {
            const p = new MaintainerCreep(0, this.pid);
            MaintainerProcess.addProcess(p);
            p.memory.creepName = creep.name;
            p.memory.roomName = this.memory.roomName;
            this.memory.childPidList.push(p.pid);
        }

    }

    public run(): number {
        const parent = Kernel.getProcessById(this.parentPID);
        if (!parent || (parent.constructor.name !== "ColonyProcess")) {
            return this.stop(0);
        }
        const room = Game.rooms[this.memory.spawningRoomName];
        if (room.storage!.store.energy < 40000) {
            Kernel.sleepProcess(this, 1500);
            return 0;
        }

        const wallAndRamparts = room.find(FIND_STRUCTURES,
            {
                filter: (s: Structure) => s.structureType === STRUCTURE_WALL ||
                    s.structureType === STRUCTURE_RAMPART,
            });

        const hpList = _.map(wallAndRamparts, (s: Structure) => s.hits);
        const constructions = room.find(FIND_CONSTRUCTION_SITES);

        if ((_.min(hpList) > 1000000) && (constructions.length === 0)) {
            Kernel.sleepProcess(this, 1000);
            return 0;
        }
        this.memory.childPidList = this.memory.childPidList || [];

        if (this.memory.childPidList.length < 2) {
            const energyCapacity = room.energyCapacityAvailable - 500 - 250;
            const multiplier = Math.floor(energyCapacity / (50 + 50));
            this.spawnCreep("maintainer", { MOVE: multiplier + 5, CARRY: multiplier, WORK: 5 });
        }
        return 0;
    }
}
