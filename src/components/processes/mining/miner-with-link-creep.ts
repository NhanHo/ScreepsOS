import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";
interface MinerWithLinkCreepMemory extends CreepMemory {
    miningSpot: any[];
    sourceId: string;
}
class MinerWithLinkCreep extends CreepProcess {
    public memory: MinerWithLinkCreepMemory;
    public classPath = "components.processes.mining.miner-with-link-creep";
    public runCreep(creep: Creep): number {
        let [x, y, roomName] = this.memory.miningSpot;
        let pos = new RoomPosition(x, y, roomName);
        if (!creep.pos.isEqualTo(pos)) {
            creep.moveTo(pos);
        } else {
            let source = <Source>Game.getObjectById(this.memory.sourceId);
            creep.harvest(source);

            if (_.sum(creep.carry) >= (creep.carryCapacity - 15)) {
                let storage = creep.room.storage;
                creep.transfer(storage, RESOURCE_ENERGY);
            }

        }

        return 0;
    }

    public setUp(creepName: string, sourceId: string, miningSpot: any) {
        this.memory.creepName = creepName;
        this.memory.sourceId = sourceId;
        this.memory.miningSpot = miningSpot;
    }
}

export = MinerWithLinkCreep;
