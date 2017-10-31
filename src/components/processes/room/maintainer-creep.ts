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
    public classPath() {
        return "components.processes.room.maintainer-creep";
    }

    public runCreep(creep: Creep): number {
        let obj = Game.getObjectById(this.memory.targetId) as Structure | ConstructionSite | null;
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
        const ramparts = room.find(FIND_STRUCTURES, { filter: (s: Rampart) => s.structureType === STRUCTURE_RAMPART && s.hits < 1000 }) as Rampart[];
        const rampart = ramparts.pop();
        if (rampart)
            return rampart;
        return null;
    }
    private acquireNewTarget(): Structure | ConstructionSite | null {
        const room = Game.rooms[this.memory.roomName];

        const lowHealthRampart = this.getLowHealthRampart(room);
        if (lowHealthRampart) {
            return lowHealthRampart;
        }
        const constructions = room.find(FIND_CONSTRUCTION_SITES) as ConstructionSite[];
        const construction = constructions.pop();
        if (construction) {
            return construction;
        }

        const structures = room.find(FIND_STRUCTURES, { filter: (s: Structure) => ((s.structureType === STRUCTURE_RAMPART) || (s.structureType === STRUCTURE_WALL)) }) as Structure[];
        const sorted = _.chain(structures).sortBy((s) => s.hits).reverse();
        const s = sorted.value().pop();
        if (s)
            return s;

        return null;
    }

    private getEnergy(creep: Creep) {
        const room = Game.rooms[this.memory.roomName];
        const storage = room.storage;
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
