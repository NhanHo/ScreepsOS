import CreepProcess = require("../creep");
import { CreepMemory } from "../memory/creep";
const WORKING = 1;
const GET_ENERGY = 2;

interface MaintainerMemory extends CreepMemory {
    roomName: string;
    targetId: string;
    current: number;
}
export = class MaintainerCreep extends CreepProcess {
    public memory: MaintainerMemory;
    public classPath = "components.processes.room.maintainer-creep";

    public runCreep(creep: Creep): number {
        let obj = <Structure | ConstructionSite | null>Game.getObjectById(this.memory.targetId);
        if (!obj) {
            obj = this.acquireNewTarget();
            if (obj)
                this.memory.targetId = obj.id;
        }
        if (obj) {
            if (creep.carry.energy === 0) {
                this.memory.current = GET_ENERGY;
            }
            if (creep.carry.energy === creep.carryCapacity && this.memory.current !== WORKING) {
                this.memory.current = WORKING;
                obj = this.acquireNewTarget();
                if (obj)
                    this.memory.targetId = obj.id;
                else
                    return 0;
            }

            if (this.memory.current === GET_ENERGY) {
                this.getEnergy(creep);
            } else {
                this.working(creep, obj);
            }
        }

        return 0;
    }

    private getLowHealthRampart(room: Room) {
        const ramparts = <Rampart[]>room.find(FIND_STRUCTURES, { filter: (s: Rampart) => s.structureType === STRUCTURE_RAMPART && s.hits < 1000 });
        const rampart = ramparts.pop();
        if (rampart)
            return rampart;
        return null;
    }
    private acquireNewTarget(): Structure | ConstructionSite | null {
        let room = Game.rooms[this.memory.roomName];

        let lowHealthRampart = this.getLowHealthRampart(room);
        if (lowHealthRampart) {
            return lowHealthRampart;
        }
        const constructions = <ConstructionSite[]>room.find(FIND_CONSTRUCTION_SITES);
        const construction = constructions.pop();
        if (construction) {
            return construction;
        }

        const structures = <Structure[]>room.find(FIND_STRUCTURES, { filter: (s: Structure) => ((s.structureType === STRUCTURE_RAMPART) || (s.structureType === STRUCTURE_WALL)) });
        const sorted = _.chain(structures).sortBy(s => s.hits).reverse();
        const s = sorted.value().pop();
        if (s)
            return s;

        return null;
    }

    private getEnergy(creep: Creep) {
        let room = Game.rooms[this.memory.roomName];
        let storage = room.storage;
        if (storage) {
            creep.moveTo(storage);
            creep.withdraw(storage, RESOURCE_ENERGY);
        }
    }
    private working(creep: Creep, obj: Structure | ConstructionSite) {
        if (!creep.pos.inRangeTo(obj.pos, 3))
            return creep.moveTo(obj);

        if (obj instanceof ConstructionSite) {
            creep.build(obj);
        } else {
            creep.repair(obj);
        }
    }

}
