import Process = require("../process");
import { getProcessById } from "../../kernel/kernel";

class MinerCreepProcess extends Process {
    public classPath = "components.processes.mining.miner-creep";
    /* Memory has
     * sourceID
     * creep name
     */

    public getMinerCreep(): Creep | null {
        return Game.creeps[this.memory.name];
    }

    public runCreep(creep: Creep) {
        let source = <Source>Game.getObjectById(this.memory.sourceId);
        if (creep.pos.isNearTo(source)) {
            creep.harvest(source);
            let energy = <Resource[]>creep.pos.lookFor(LOOK_ENERGY);
            if (energy.length) {
                creep.pickup(energy[0]);
            }

        } else
            creep.moveTo(source);
    }

    public stop(signal: number): number {
        let p: any = getProcessById(this.parentPID);
        if (p)
            p.minerDies(this.pid);
        return super.stop(signal);
    }

    public setUp(creepName: string, sourceId: string) {
        this.memory.name = creepName;
        this.memory.sourceId = sourceId;
    }
    public run(): number {
        let creep = Game.creeps[this.memory.name];
        if (!creep) {
            this.stop(0)
        } else {
            if (!this.parentPID) {
                creep.suicide();
                return this.stop(0);
            }
            this.runCreep(creep);
        }
        return 0;
    }
}

export = MinerCreepProcess;
