import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";
import { getProcessById } from "../../kernel/kernel";
import MiningProcess = require("../mining/mining");
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
    
    public run(): number {
        let creep = Game.creeps[this.memory.creepName];

        if (!creep) {
            console.log("A creep has disappeared:" + this.memory.creepName);
            if (this.parentPID !== 0) {
                let p = <MiningProcess> getProcessById(this.parentPID);
                p.minerDies(this.pid);
            }
            return this.stop(0);
        } else {
            this.runCreep(creep);
            return 0;
        }
    }

    public setUp(creepName: string, sourceId: string, miningSpot: any) {
        this.memory.creepName = creepName;
        this.memory.sourceId = sourceId;
        this.memory.miningSpot = miningSpot;
    }
}

export = MinerWithLinkCreep;
