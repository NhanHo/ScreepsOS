import Process = require("../../kernel/kernel/process");
import { getProcessById } from "../../kernel/kernel/kernel";
import MiningProcess = require("../mining/mining");
class MinerCreepProcess extends Process {
    public classPath() {
        return "components.processes.mining.miner-creep";
    }
    /* Memory has
     * sourceID
     * creep name
     */

    public getMinerCreep(): Creep | null {
        return Game.creeps[this.memory.name];
    }

    public runCreep(creep: Creep) {
        // Right now, we will make the miner check for its own container, and build or repair as needed
        // Ideally, this could be done from outside.
        // TODO: Best way to do this would be to have a separate creep that will do repair, and spawn it as necessary (and by separate creep, I mean a different class)
        const source = <Source>Game.getObjectById(this.memory.sourceId);
        const containerList = _.filter(<Container[]>creep.pos.lookFor(LOOK_STRUCTURES),
            s => s.structureType === STRUCTURE_CONTAINER);
        const container = <Container>containerList![0];
        if (creep.pos.isNearTo(source)) {
            creep.harvest(source);
            const energy = <Resource[]>creep.pos.lookFor(LOOK_ENERGY);
            if (energy.length) {
                creep.pickup(energy[0]);
            }
            if (container) {
                if (container.hits < (0.5 * container.hitsMax)) {
                    if ((creep.carry.energy) && (creep.carry.energy > 30))
                        creep.repair(container);
                }
                if (container.store.energy > 0)
                    container.transfer(creep, RESOURCE_ENERGY);
                if (container.store.energy > 1800) {
                    let p = <MiningProcess>getProcessById(this.parentPID);
                    p.needMoreCourier();
                }
                if (_.sum(container.store) < 700) {
                    let p = <MiningProcess>getProcessById(this.parentPID);
                    p.lowContainerUsage();
                }
            } else {
                let constructionSite: ConstructionSite[] = <ConstructionSite[]>creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (!constructionSite.length) {
                    creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
                    constructionSite = <ConstructionSite[]>creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                }
                if ((creep.carry.energy) && (creep.carry.energy > 30))
                    creep.build(constructionSite[0]);
            }
        } else {
            let [x, y, roomName] = this.memory.miningSpot;
            let pos = new RoomPosition(x, y, roomName);
            creep.moveTo(pos);

        }
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
